using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data
{
    //Handles communication with DB
    public class ChatAppDbContext : DbContext
    {
        public ChatAppDbContext(DbContextOptions<ChatAppDbContext> options) : base(options) { }

        //Tables in DB
        public DbSet<ChatMessage> ChatMessages { get; set; } = null!;
        public DbSet<User> Users { get; set; } = null!;
        public DbSet<ChatRoom> ChatRooms { get; set; } = null!;
        public DbSet<UserChatRoom> UserChatRoom { get; set; } = null!;

    }
}