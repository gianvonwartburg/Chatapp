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

        // <summary>
        /// Ermöglicht einem Benutzer, einem ChatRoom beizutreten.
        /// </summary>
        [HttpPost("join")]
        public async Task<IActionResult> JoinChatRoom([FromBody] JoinChatRequestDto request)
        {
            // Überprüfen, ob der Benutzer existiert
            var user = await _dbContext.Users.FindAsync(request.UserId);
            if (user == null)
                return NotFound("User not found.");

            // ChatRoom anhand des Namens finden
            var chatRoom = await _dbContext.ChatRooms
                .FirstOrDefaultAsync(cr => cr.Name == request.ChatRoomName);
            if (chatRoom == null)
                return NotFound("ChatRoom not found.");

            // Überprüfen, ob ein Passwort erforderlich ist
            if (!string.IsNullOrWhiteSpace(chatRoom.PasswordHash))
            {
                if (string.IsNullOrWhiteSpace(request.Password) ||
                    chatRoom.PasswordHash != HashPassword(request.Password))
                {
                    return Unauthorized("Invalid password.");
                }
            }

            // Überprüfen, ob der Benutzer bereits mit dem ChatRoom verknüpft ist
            var existingLink = await _dbContext.UserChatRoom
                .FirstOrDefaultAsync(uc => uc.UserId == request.UserId && uc.ChatRoomId == chatRoom.Id);

            if (existingLink == null)
            {
                // Verknüpfung erstellen, falls sie nicht existiert
                var userChatRoom = new UserChatRoom
                {
                    UserId = request.UserId,
                    ChatRoomId = chatRoom.Id
                };
                _dbContext.UserChatRoom.Add(userChatRoom);
                await _dbContext.SaveChangesAsync();
            }            

            // Erfolgreiche Rückgabe
            return Ok(new
            {
                ChatRoomId = chatRoom.Id,
                ChatRoomName = chatRoom.Name
            });
        }


        [HttpGet("{userId}")]
        public async Task<IActionResult> GetUserChats(int userId)
        {
            var user = await _dbContext.Users.FindAsync(userId);
            if (user == null)
                return NotFound("User not found");

            var chatRooms = await _dbContext.UserChatRoom
                .Where(uc => uc.UserId == userId)
                .Select(uc => new
                {
                    uc.ChatRoom.Id,
                    uc.ChatRoom.Name,
                    HasPassword = !string.IsNullOrEmpty(uc.ChatRoom.PasswordHash)
                })
                .ToListAsync();

            return Ok(chatRooms);
        }        

        [HttpPost("create")]
        public async Task<IActionResult> CreateChat([FromBody] ChatRoom chatRoom, [FromQuery] int userId)
        {            
            if (string.IsNullOrWhiteSpace(chatRoom.Name))
                return BadRequest("ChatRoom Name is required.");

            //Check if user exists
            var user = await _dbContext.Users.FindAsync(userId);
            if (user == null)
                return NotFound("User not found.");

            // Passwort hashen (falls angegeben)
            if (!string.IsNullOrWhiteSpace(chatRoom.PasswordHash))
            {
                chatRoom.PasswordHash = HashPassword(chatRoom.PasswordHash);
            }

            //Chatroom speichern
            _dbContext.ChatRooms.Add(chatRoom);
            await _dbContext.SaveChangesAsync();

            // Den Ersteller direkt mit dem neuen Chat verknüpfen
            var userChatRoom = new UserChatRoom
            {
                UserId = userId,
                ChatRoomId = chatRoom.Id
            };
            _dbContext.Add(userChatRoom);
            await _dbContext.SaveChangesAsync();

            return Ok(new { message = "ChatRoom created", chatRoomId = chatRoom.Id });
        }

        /// <summary>
        /// Hashes a password using SHA256.
        /// </summary>
        private string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }
    }
}
