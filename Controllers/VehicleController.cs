using AutoMapper;
using Car_Repair_Shop.Data;
using Car_Repair_Shop.Data.Dtos.VehicleDto;
using Car_Repair_Shop.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Car_Repair_Shop.Controllers;

[ApiController]
[Route("[controller]")]
public class VehicleController : ControllerBase
{
    private readonly IMapper _mapper;
    private readonly AppDbContext _appDbContext;

    public VehicleController(IMapper mapper, AppDbContext appDbContext)
    {
        _mapper = mapper;
        _appDbContext = appDbContext;
    }

    [HttpPost]
    public async Task<IActionResult> CreateVehicle([FromBody] CreateVehicleDto dto)
    {
        var clientExists = await _appDbContext.Clients.AnyAsync(c => c.Id == dto.ClientId);
        if (!clientExists) return BadRequest($"Cliente com id {dto.ClientId} não existe");

        var vehicle = _mapper.Map<Vehicle>(dto);
        _appDbContext.Vehicles.Add(vehicle);
        await _appDbContext.SaveChangesAsync();

        await _appDbContext.Entry(vehicle).Reference(v => v.Client).LoadAsync();

        var readVehicleDto = _mapper.Map<ReadVehicleDto>(vehicle);
        return CreatedAtAction(nameof(GetVehicleById), new {vehicle.Id}, readVehicleDto);
    }

    [HttpGet]
    public async Task<IActionResult> GetAllVehicles([FromQuery] int skip = 0, [FromQuery] int take = 20)
    {
        var vehicles = await _appDbContext.Vehicles
            .Include(v => v.Client)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
        return Ok(_mapper.Map<List<ReadVehicleDto>>(vehicles));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetVehicleById(int id)
    {
        var vehicle = await _appDbContext.Vehicles
            .Include(vehicle => vehicle.Client)
            .FirstOrDefaultAsync(vehicle => vehicle.Id == id);

        if (vehicle == null) return NotFound();
        return Ok(_mapper.Map<ReadVehicleDto>(vehicle));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateVehicle(int id, [FromBody] UpdateVehicleDto dto)
    {
        var vehicle = await _appDbContext.Vehicles.FirstOrDefaultAsync(vehicle => vehicle.Id == id);
        if (vehicle == null) return NotFound();

        var clientExists = await _appDbContext.Clients.AnyAsync(client => client.Id == dto.ClientId);
        if (!clientExists) return BadRequest($"Cliente com id {dto.ClientId} não existe.");

        _mapper.Map(dto, vehicle);
        await _appDbContext.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteVehicle(int id)
    {
        var vehicle = await _appDbContext.Vehicles.FirstOrDefaultAsync(vehicle => vehicle.Id == id);
        if (vehicle == null) return NotFound();
        _appDbContext.Vehicles.Remove(vehicle);
        await _appDbContext.SaveChangesAsync();
        return NoContent();
    }
}
