using AutoMapper;
using Car_Repair_Shop.Data;
using Car_Repair_Shop.Data.Dtos.WorkOrderDto;
using Car_Repair_Shop.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


namespace Car_Repair_Shop.Controllers;

[ApiController]
[Route("[controller]")]
public class WorkOrderController : ControllerBase
{
    private readonly IMapper _mapper;
    private readonly AppDbContext _appDbContext;

    public WorkOrderController(IMapper mapper, AppDbContext appDbContext)
    {
        _mapper = mapper;
        _appDbContext = appDbContext;
    }

    [HttpPost]
    public async Task<IActionResult> CreateWorkOrder([FromBody] CreateWorkOrderDto dto)
    {
        var clientExists = await _appDbContext.Clients.AnyAsync(c => c.Id == dto.ClientId);
        if (!clientExists) return BadRequest($"Cliente com id {dto.ClientId} não existe");

        var vehicleExists = await _appDbContext.Vehicles.AnyAsync(v => v.Id == dto.VehicleId);
        if (!vehicleExists) return BadRequest($"Veículo com id {dto.VehicleId} não existe");

        var mechanicExists = await _appDbContext.Mechanics.AnyAsync(m => m.Id == dto.MechanicId);
        if (!mechanicExists) return BadRequest($"Mecânico com id {dto.MechanicId} não existe");

        var workOrder = _mapper.Map<WorkOrder>(dto);
        _appDbContext.WorkOrders.Add(workOrder);
        await _appDbContext.SaveChangesAsync();

        var readWorkOrder = _mapper.Map<ReadWorkOrderDto>(workOrder);
        return CreatedAtAction(nameof(GetWorkOrderById), new {workOrder.Id}, readWorkOrder);
    }

    [HttpGet]
    public async Task<IActionResult> GetAllWorkOrders([FromQuery] int skip = 0, [FromQuery] int take = 20)
    {
        var workOders = await _appDbContext.WorkOrders
            .Skip(skip)
            .Take(take)
            .ToListAsync();
        return Ok(_mapper.Map<List<ReadWorkOrderDto>>(workOders));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetWorkOrderById(int id)
    {
        var workOrder = await _appDbContext.WorkOrders.FirstOrDefaultAsync(w => w.Id == id);
        if (workOrder == null) return NotFound();
        return Ok(_mapper.Map<ReadWorkOrderDto>(workOrder));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateWorkOrder(int id, UpdateWorkOrderDto dto)
    {
        var workOrder = await _appDbContext.WorkOrders.FirstOrDefaultAsync(w => w.Id == id);
        if (workOrder == null) return NotFound();

        _mapper.Map(dto, workOrder);
        await _appDbContext.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteWorkOrder(int id)
    {
        var workOrder = await _appDbContext.WorkOrders.FirstOrDefaultAsync(w => w.Id == id);
        if (workOrder == null) return NotFound();

        _appDbContext.WorkOrders.Remove(workOrder);
        await _appDbContext.SaveChangesAsync();
        return NoContent();
    }
}
