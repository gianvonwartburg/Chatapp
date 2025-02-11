using Backend.Data;
using Backend.Dtos;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/chats")]
    public class ChatController : ControllerBase
    {
        private readonly ChatAppDbContext _dbContext;

        public ChatController(ChatAppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        /// <summary>
        /// Lets a User Join a ChatRoom by ChatRoomName and creates Link between Chat and User
        /// </summary>
        /// <param name="request">JoinRequest</param>
        /// <returns></returns>
        [HttpPost("join")]
        public async Task<IActionResult> JoinChatRoom([FromBody] JoinChatRequestDto request)
        {
            //Validate Input
            var user = await _dbContext.Users.FindAsync(request.UserId);
            if (user == null)
                return NotFound("User not found.");

            var chatRoom = await _dbContext.ChatRooms
                .FirstOrDefaultAsync(cr => cr.Name == request.ChatRoomName);
            if (chatRoom == null)
                return NotFound("ChatRoom not found.");

            // Check for password
            if (!string.IsNullOrWhiteSpace(chatRoom.PasswordHash))
            {
                if (string.IsNullOrWhiteSpace(request.Password) ||
                    chatRoom.PasswordHash != HashPassword(request.Password))
                {
                    return Unauthorized("Invalid password.");
                }
            }

            //Check if user is already linked to ChatRoom
            var existingLink = await _dbContext.UserChatRoom
                .FirstOrDefaultAsync(uc => uc.UserId == request.UserId && uc.ChatRoomId == chatRoom.Id);

            if (existingLink == null)
            {
                // Create Link
                var userChatRoom = new UserChatRoom
                {
                    UserId = request.UserId,
                    ChatRoomId = chatRoom.Id
                };
                _dbContext.UserChatRoom.Add(userChatRoom);
                await _dbContext.SaveChangesAsync();
            }            

            // Return ChatRoomId & Name
            return Ok(new
            {
                ChatRoomId = chatRoom.Id,
                ChatRoomName = chatRoom.Name
            });
        }

        /// <summary>
        /// Gets Chats of a User 
        /// </summary>
        /// <param name="userId">Id of User</param>
        /// <returns>List of chats containing ChatRoomId, ChatRoomName, flag if chat has password</returns>
        [HttpGet("{userId}")]
        public async Task<IActionResult> GetUserChats(int userId)
        {
            //Validate input
            var user = await _dbContext.Users.FindAsync(userId);
            if (user == null)
                return NotFound("User not found");
           
            var chatRooms = await _dbContext.UserChatRoom
                .Where(uc => uc.UserId == userId)
                .Select(uc => new
                {
                    uc.ChatRoom.Id, //Id of ChatRoom --> NavigationProperty is used here
                    uc.ChatRoom.Name, //Id of ChatRoom --> NavigationProperty is used here
                    HasPassword = !string.IsNullOrEmpty(uc.ChatRoom.PasswordHash)
                })
                .ToListAsync();

            return Ok(chatRooms);
        }        

        /// <summary>
        /// Create a Chat
        /// </summary>
        /// <param name="chatRoomDto">ChatRoom Dto</param>
        /// <param name="userId">Id of User</param>
        /// <returns>completed Task with created ChatRoomId</returns>
        [HttpPost("create")]
        public async Task<IActionResult> CreateChat([FromBody] ChatRoomDto chatRoomDto, [FromQuery] int userId)
        {            
            //Validate input
            if (string.IsNullOrWhiteSpace(chatRoomDto.Name))
                return BadRequest("ChatRoom Name is required.");

            var user = await _dbContext.Users.FindAsync(userId);
            if (user == null)
                return NotFound("User not found.");

            var existingChatRoom = await _dbContext.ChatRooms.FirstOrDefaultAsync(cr => cr.Name == chatRoomDto.Name);
            if (existingChatRoom != null)
                return BadRequest("A Chatroom with this name already exists.");

            // Hash Password
            if (!string.IsNullOrWhiteSpace(chatRoomDto.Password))
            {
                chatRoomDto.Password = HashPassword(chatRoomDto.Password);
            }

            //Create DB Model
            var chatRoomModel = new ChatRoom()
            {
                PasswordHash = chatRoomDto.Password,
                Name = chatRoomDto.Name,
            };

            //Save Chatroom
            _dbContext.ChatRooms.Add(chatRoomModel);
            await _dbContext.SaveChangesAsync(); //Id of chatroom gets set 

            //Create Link between new Chat and Creator
            var userChatRoom = new UserChatRoom
            {
                UserId = userId,
                ChatRoomId = chatRoomModel.Id
            };
            _dbContext.Add(userChatRoom);
            await _dbContext.SaveChangesAsync();

            return Ok(new {chatRoomId = chatRoomModel.Id });
        }

        /// <summary>
        /// Removes link between User and ChatRoom
        /// </summary>
        /// <param name="userId">Id of the User</param>
        /// <param name="chatRoomId">Id of the ChatRoom</param>
        /// <returns>Completed Task</returns>
        [HttpDelete("leave")]
        public async Task<IActionResult> LeaveChatRoom([FromQuery] int userId, [FromQuery] int chatRoomId)
        {
            // Validate input
            var userChatRoom = await _dbContext.UserChatRoom
                .FirstOrDefaultAsync(uc => uc.UserId == userId && uc.ChatRoomId == chatRoomId);

            if (userChatRoom == null)
                return NotFound("The user is not a member of this ChatRoom.");

            // Remove the link
            _dbContext.UserChatRoom.Remove(userChatRoom);
            await _dbContext.SaveChangesAsync();

            return Ok();
        }



        /// <summary>
        /// Hashes a password using SHA256
        /// </summary>
        /// <param name="password">password as string</param>
        /// <returns>Hashed password</returns>
        private string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }
    }
}
