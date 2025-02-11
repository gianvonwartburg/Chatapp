using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Text;
using System.Security.Cryptography;


namespace Backend.Hubs
{
    public class ChatHub : Hub
    {
        private readonly ChatAppDbContext _dbContext;

        public ChatHub(ChatAppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        /// <summary>
        /// Sends a Message in a ChatRoom and saves it to DB
        /// </summary>
        /// <param name="userId">id of user</param>
        /// <param name="chatRoomId">id of chatroom</param>
        /// <param name="message">message</param>
        public async Task SendMessage(int userId, int chatRoomId, string message)
        {
            // validate input
            var user = await _dbContext.Users.FindAsync(userId);
            if (user == null)
            {
                await Clients.Caller.SendAsync("ReceiveMessage", "ChatApp", "Ungültiger Benutzer.");
                return;
            }

            var chatRoom = await _dbContext.ChatRooms.FindAsync(chatRoomId);
            if (chatRoom == null)
            {
                await Clients.Caller.SendAsync("ReceiveMessage", "ChatApp", "Ungültiger ChatRoom.");
                return;
            }

            // Save Message
            var chatMessage = new ChatMessage
            {
                UserId = userId,
                ChatRoomId = chatRoomId,
                Message = message,
                Timestamp = DateTime.UtcNow
            };

            _dbContext.ChatMessages.Add(chatMessage);
            await _dbContext.SaveChangesAsync();

            //Send Message to all in Group
            await Clients.Group(chatRoomId.ToString()).SendAsync("ReceiveMessage", user.Username, message, chatMessage.Timestamp);
        }

        /// <summary>
        /// Ûser Joins a specific ChatRoom
        /// </summary>
        /// <param name="userId">id of user</param>
        /// <param name="chatRoomId">id of chatroom</param>
        /// <param name="password">password of chatroom</param>
        public async Task JoinChatRoom(int userId, int chatRoomId, string? password = null)
        {
            // Validate input
            var user = await _dbContext.Users.FindAsync(userId);
            if (user == null)
            {
                await Clients.Caller.SendAsync("ReceiveMessage", "ChatApp", "Ungültiger Benutzer.");
                return;
            }

            var chatRoom = await _dbContext.ChatRooms.FindAsync(chatRoomId);
            if (chatRoom == null)
            {
                await Clients.Caller.SendAsync("ReceiveMessage", "ChatApp", "Ungültiger ChatRoom.");
                return;
            }

            // Check Password
            if (!string.IsNullOrWhiteSpace(chatRoom.PasswordHash))
            {
                if (string.IsNullOrWhiteSpace(password) || chatRoom.PasswordHash != HashPassword(password))
                {
                    await Clients.Caller.SendAsync("ReceiveMessage", "ChatApp", "Ungültiges Passwort.");
                    return;
                }
            }

            // Add Connection to group
            await Groups.AddToGroupAsync(Context.ConnectionId, chatRoomId.ToString());

            // Load MessageHistory
            var messages = await _dbContext.ChatMessages
                .Where(m => m.ChatRoomId == chatRoomId) //Filter by ChatRoomId
                .OrderBy(m => m.Timestamp) //Order oldest to newest
                .Select(m => new
                {
                    sender = _dbContext.Users.FirstOrDefault(u => u.Id == m.UserId).Username,//Sender Username
                    receivedMessage = m.Message,
                    timestamp = m.Timestamp
                })
                .ToListAsync();

            await Clients.Caller.SendAsync("LoadMessages", messages);

            // Notification for other Users in ChatRoom
            await Clients.OthersInGroup(chatRoomId.ToString()).SendAsync("ReceiveMessage", "ChatApp", $"{user.Username} hat den Chat betreten.", DateTime.UtcNow);
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
