using Backend.Data;
using Backend.Hubs;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

//Register SignalR
builder.Services.AddSignalR();

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

//Inject DBContext with SQL Server
builder.Services.AddDbContext<ChatAppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

//Add Cors -> unterschiedliche URL Calls allowen hier (kommunikation erlauben von localhost:3000)
builder.Services.AddCors(opt => 
{
    opt.AddPolicy("ChatApp", builder =>
    {
        builder.WithOrigins("http://localhost:3000")
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

//useCors
app.UseCors("ChatApp");

app.UseAuthorization();

app.MapControllers();


// Map the SignalR Hub --> Makes ChatHub reachable under localhost/chat
app.MapHub<ChatHub>("/hubs/chat");

app.Run();
