using AutoMapper;
using Car_Repair_Shop.Data;
using Car_Repair_Shop.Data.Dtos.MechanicDto;
using Car_Repair_Shop.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Car_Repair_Shop.Controllers;

[ApiController]
[Route("[controller]")]
public class MechanicController : ControllerBase
{
    private readonly IMapper _mapper;
    private readonly AppDbContext _appDbContext;

    public MechanicController(IMapper mapper, AppDbContext appDbContext)
    {
        _mapper = mapper;
        _appDbContext = appDbContext;
    }

    [HttpPost]
    public async Task<IActionResult> CreateMechanic([FromBody] CreateMechanicDto dto)
    {
        var mechanic = _mapper.Map<Mechanic>(dto);
        _appDbContext.Mechanics.Add(mechanic);
        await _appDbContext.SaveChangesAsync();

        var readMechanic = _mapper.Map<ReadMechanicDto>(mechanic);
        return CreatedAtAction(nameof(GetMechanicById), new { mechanic.Id }, readMechanic);
    }

    [HttpGet]
    public async Task<IActionResult> GetAllMechanics([FromQuery] int skip = 0, [FromQuery] int take = 20)
    {
        var mechanics = await _appDbContext.Mechanics
            .Skip(skip)
            .Take(take)
            .ToListAsync();
        return Ok(_mapper.Map<List<ReadMechanicDto>>(mechanics));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetMechanicById(int id)
    {
        var mechanic = await _appDbContext.Mechanics.FirstOrDefaultAsync(m =>  m.Id == id);
        if (mechanic == null) return NotFound();
        return Ok(_mapper.Map<ReadMechanicDto>(mechanic));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateMechanic(int id, [FromBody] UpdateMechanicDto dto)
    {
        var mechanic = await _appDbContext.Mechanics.FirstOrDefaultAsync(m => m.Id == id);
        if (mechanic == null) return NotFound();

        _mapper.Map(dto, mechanic);
        await _appDbContext.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMechanic(int id)
    {
        var mechanic = await _appDbContext.Mechanics.FirstOrDefaultAsync(m => m.Id == id);
        if (mechanic == null) return NotFound();

        _appDbContext.Mechanics.Remove(mechanic);
        await _appDbContext.SaveChangesAsync();
        return NoContent();
    }
}
