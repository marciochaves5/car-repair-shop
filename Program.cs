using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Car_Repair_Shop.Models;
using Car_Repair_Shop.Data;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString));

builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 6;
    options.Password.RequireUppercase = false;
    options.Password.RequireNonAlphanumeric = false;
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();

// Controllers de API (não MVC com views)
builder.Services.AddControllers();

// CORS: essencial pra React (rodando em outra porta) conseguir chamar sua API
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173") // ou 3000, dependendo do Vite/CRA
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});


var app = builder.Build();

app.UseHttpsRedirection();
app.UseCors("AllowReactApp"); // antes de Authentication/Authorization
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();