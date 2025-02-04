using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data
{
    //Kommunikation mit der Datenbank
    public class ChatAppDbContext : DbContext
    {
        public ChatAppDbContext(DbContextOptions<ChatAppDbContext> options) : base(options) { }

        //Tabellen in der Datenbank
        public DbSet<ChatMessage> ChatMessages { get; set; } = null!;
    }
}
