using Backend.Data;
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

        ///// <summary>
        ///// Gibt alle ChatRooms für einen User zurück.
        ///// </summary>
        //[HttpGet("{userId}")]
        //public async Task<IActionResult> GetUserChats(int userId)
        //{
        //    var user = await _dbContext.Users.FindAsync(userId);
        //    if (user == null)
        //        return NotFound("User not found");

        //    var chats = await _dbContext.ChatMessages
        //        .Where(m => m.UserId == userId)
        //        .Select(m => m.ChatRoomId)
        //        .Distinct()
        //        .ToListAsync();

        //    var chatRooms = await _dbContext.ChatRooms
        //        .Where(c => chats.Contains(c.Id))
        //        .Select(c => new
        //        {
        //            c.Id,
        //            c.Name,
        //            HasPassword = !string.IsNullOrEmpty(c.PasswordHash) // Überprüfen, ob ein Passwort existiert
        //        })
        //        .ToListAsync();

        //    return Ok(chatRooms);
        //}

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



        ///// <summary>
        ///// Erstellt einen neuen ChatRoom.
        ///// </summary>
        //[HttpPost("create")]
        //public async Task<IActionResult> CreateChat([FromBody] ChatRoom chatRoom)
        //{
        //    if (string.IsNullOrWhiteSpace(chatRoom.Name))
        //        return BadRequest("ChatRoom Name is required.");

        //    // Passwort hashen (falls angegeben)
        //    if (!string.IsNullOrWhiteSpace(chatRoom.PasswordHash))
        //    {
        //        chatRoom.PasswordHash = HashPassword(chatRoom.PasswordHash);
        //    }

        //    _dbContext.ChatRooms.Add(chatRoom);
        //    await _dbContext.SaveChangesAsync();

        //    return Ok(new { message = "ChatRoom created", chatRoomId = chatRoom.Id });
        //}

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
