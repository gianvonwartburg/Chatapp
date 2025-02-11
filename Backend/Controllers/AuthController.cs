using Backend.Data;
using Backend.Models;
using Backend.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
using Azure.Core;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly ChatAppDbContext _dbContext;

        public AuthController(ChatAppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        /// <summary>
        /// Register User
        /// </summary>
        /// <param name="requestDto">Request Dto with username and password</param>
        /// <returns>Completed Task with username and userId</returns>
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] UserAuthDto requestDto)
        {
            //Validate Input
            if (string.IsNullOrWhiteSpace(requestDto.Username) || string.IsNullOrWhiteSpace(requestDto.Password))
                return BadRequest("Username and password are required.");

            if (await _dbContext.Users.AnyAsync(u => u.Username == requestDto.Username))
                return BadRequest("Username already exists");

            // Hash password and create user
            var user = new User
            {
                Username = requestDto.Username,
                PasswordHash = HashPassword(requestDto.Password),
            };

            _dbContext.Users.Add(user);
            await _dbContext.SaveChangesAsync();

            // Return username and userId
            return Ok(new { username = user.Username, userId = user.Id });
        }

        /// <summary>
        /// Login User
        /// </summary>
        /// <param name="requestDto">Request Dto with username and password</param>
        /// <returns>Completed Task with username and userId</returns>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserAuthDto requestDto)
        {
            //Validate Input
            if (string.IsNullOrWhiteSpace(requestDto.Username) || string.IsNullOrWhiteSpace(requestDto.Password))
                return BadRequest("Username and password are required.");

            //Check if Username  exists and if password is correct
            var dbUser = await _dbContext.Users.FirstOrDefaultAsync(u => u.Username == requestDto.Username);            
            if (dbUser == null || HashPassword(requestDto.Password) != dbUser.PasswordHash)
                return Unauthorized("Invalid username or password");


            return Ok(new { username = dbUser.Username, userId = dbUser.Id });
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