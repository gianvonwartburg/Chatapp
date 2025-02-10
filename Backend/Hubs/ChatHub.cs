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
        /// Sendet eine Nachricht und speichert sie in der Datenbank.
        /// </summary>
        public async Task SendMessage(int userId, int chatRoomId, string message)
        {
            // Prüfen, ob User existiert
            var user = await _dbContext.Users.FindAsync(userId);
            if (user == null)
            {
                await Clients.Caller.SendAsync("ReceiveMessage", "ChatApp", "Ungültiger Benutzer.");
                return;
            }

            // Prüfen, ob ChatRoom existiert
            var chatRoom = await _dbContext.ChatRooms.FindAsync(chatRoomId);
            if (chatRoom == null)
            {
                await Clients.Caller.SendAsync("ReceiveMessage", "ChatApp", "Ungültiger ChatRoom.");
                return;
            }

            // Nachricht speichern
            var chatMessage = new ChatMessage
            {
                UserId = userId,
                ChatRoomId = chatRoomId,
                Message = message,
                Timestamp = DateTime.UtcNow
            };

            _dbContext.ChatMessages.Add(chatMessage);
            await _dbContext.SaveChangesAsync();

            // Nachricht an alle in der Gruppe senden
            await Clients.Group(chatRoomId.ToString()).SendAsync("ReceiveMessage", user.Username, message, chatMessage.Timestamp);
        }

        /// <summary>
        /// Nutzer tritt einem bestimmten ChatRoom bei.
        /// </summary>
        public async Task JoinChatRoom(int userId, int chatRoomId, string? password = null)
        {
            // Überprüfen, ob User existiert
            var user = await _dbContext.Users.FindAsync(userId);
            if (user == null)
            {
                await Clients.Caller.SendAsync("ReceiveMessage", "ChatApp", "Ungültiger Benutzer.");
                return;
            }

            // Überprüfen, ob ChatRoom existiert
            var chatRoom = await _dbContext.ChatRooms.FindAsync(chatRoomId);
            if (chatRoom == null)
            {
                await Clients.Caller.SendAsync("ReceiveMessage", "ChatApp", "Ungültiger ChatRoom.");
                return;
            }

            // Passwort prüfen, falls ChatRoom geschützt ist
            if (!string.IsNullOrWhiteSpace(chatRoom.PasswordHash))
            {
                if (string.IsNullOrWhiteSpace(password) || chatRoom.PasswordHash != HashPassword(password))
                {
                    await Clients.Caller.SendAsync("ReceiveMessage", "ChatApp", "Ungültiges Passwort.");
                    return;
                }
            }

            // Verbindung zur Gruppe hinzufügen
            await Groups.AddToGroupAsync(Context.ConnectionId, chatRoomId.ToString());

            // Nachrichtenverlauf laden
            var messages = await _dbContext.ChatMessages
                .Where(m => m.ChatRoomId == chatRoomId)
                .OrderBy(m => m.Timestamp)
                .Select(m => new
                {
                    sender = _dbContext.Users.FirstOrDefault(u => u.Id == m.UserId).Username,
                    receivedMessage = m.Message,
                    timestamp = m.Timestamp
                })
                .ToListAsync();

            await Clients.Caller.SendAsync("LoadMessages", messages);

            // Benachrichtige andere Nutzer im ChatRoom
            await Clients.OthersInGroup(chatRoomId.ToString()).SendAsync("ReceiveMessage", "ChatApp", $"{user.Username} hat den Chat betreten.", DateTime.UtcNow);
        }

        private string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }
    }
}
