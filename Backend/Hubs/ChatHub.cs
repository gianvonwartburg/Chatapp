using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.SignalR;

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
        /// Save Message to Database and sends Message to all Users in given Chatroom
        /// </summary>
        /// <param name="username">Username</param>
        /// <param name="chatRoom">Given Chatroom</param>
        /// <param name="message">User Message</param>
        /// <returns>completed Task</returns>
        public async Task SendMessage(string username, string chatRoom, string message)
        {
            // Nachricht speichern
            var chatMessage = new ChatMessage
            {
                Username = username,
                ChatRoom = chatRoom,
                Message = message
            };
            _dbContext.ChatMessages.Add(chatMessage);
            await _dbContext.SaveChangesAsync();

            // Nachricht an alle User im ChatRoom senden
            await Clients.Group(chatRoom).SendAsync("ReceiveMessage", username, message);
        }

        /// <summary>
        /// Add User to specific ChatRoom 
        /// loads all messages from database for this chatroom, and sends them to the joined user
        /// Tells all users in the chatroom that a new user joined
        /// </summary>
        /// <param name="connection"></param>
        /// <returns></returns>
        public async Task JoinSpecificChat(UserConnection connection)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, connection.ChatRoom);

            // Alte Nachrichten abrufen
            var messages = _dbContext.ChatMessages
                .Where(m => m.ChatRoom == connection.ChatRoom)
                .OrderBy(m => m.Timestamp)
                .ToList();

            await Clients.Caller.SendAsync("LoadMessages", messages);

            await Clients.Group(connection.ChatRoom).SendAsync("ReceiveMessage", "admin", $"{connection.Username} has joined the Chatroom {connection.ChatRoom}");
        }

        //public async Task JoinChat(UserConnection connection)
        //{
        //    //TODO Validate Password
        //    //validate(connection.Username, connection.password)            

        //    await Clients.All.SendAsync("ReceiveMessage", "admin", $"{connection.Username} has joined the Chat");
        //}

        //public async Task JoinSpecificChat(UserConnection connection)
        //{
        //    //Add User to Specific Chatroom
        //    await Groups.AddToGroupAsync(Context.ConnectionId, connection.ChatRoom);
        //    await Clients.Group(connection.ChatRoom).SendAsync("ReceiveMessage", "admin", $"{connection.Username} has joined the Chatroom ${connection.ChatRoom}");
        //}
    }
}
