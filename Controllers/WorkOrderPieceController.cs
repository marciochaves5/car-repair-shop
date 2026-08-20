using AutoMapper;
using Car_Repair_Shop.Data;
using Car_Repair_Shop.Data.Dtos.WorkOrderPieceDto;
using Car_Repair_Shop.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Car_Repair_Shop.Controllers;

[ApiController]
[Route("[controller]")]
public class WorkOrderPieceController : ControllerBase
{
    private readonly IMapper _mapper;
    private readonly AppDbContext _appDbContext;

    public WorkOrderPieceController(IMapper mapper, AppDbContext appDbContext)
    {
        _mapper = mapper;
        _appDbContext = appDbContext;
    }

    [HttpPost]
    public async Task<IActionResult> CreateWorkOrderPiece([FromBody] CreateWorkOrderPieceDto dto)
    {
        var workOrderExists = await _appDbContext.WorkOrders.AnyAsync(w => w.Id == dto.WorkOrderId);
        if (!workOrderExists) return BadRequest($"Ordem de serviço com id {dto.WorkOrderId} não existe.");

        var pieceExists = await _appDbContext.Pieces.AnyAsync(p => p.Id == dto.PieceId);
        if (!pieceExists) return BadRequest($"Peça com id {dto.PieceId} não existe.");

        var alreadyExists = await _appDbContext.WorkOrdersPiece
            .AnyAsync(wp => wp.WorkOrderId == dto.WorkOrderId && wp.PieceId == dto.PieceId);
        if (alreadyExists) return BadRequest("Essa peça já está vinculada a essa ordem de serviço.");

        var workOrderPiece = _mapper.Map<WorkOrderPiece>(dto);
        _appDbContext.WorkOrdersPiece.Add(workOrderPiece);
        await _appDbContext.SaveChangesAsync();

        var readWorkOrderPiece = _mapper.Map<ReadWorkOrderPieceDto>(workOrderPiece);
        return CreatedAtAction(nameof(GetWorkOrderPieceById), new
        {
            workOrderId = workOrderPiece.WorkOrderId,
            pieceId = workOrderPiece.PieceId
        }, readWorkOrderPiece);
    }

    [HttpGet]
    public async Task<IActionResult> GetAllWorkOrderPieces([FromQuery] int skip = 0, [FromQuery] int take = 20)
    {
        var workOrderPieces = await _appDbContext.WorkOrdersPiece
            .Skip(skip)
            .Take(take)
            .ToListAsync();
        return Ok(_mapper.Map<List<ReadWorkOrderPieceDto>>(workOrderPieces));
    }

    [HttpGet("{workOrderId}/{pieceId}")]
    public async Task<IActionResult> GetWorkOrderPieceById(int workOrderId, int pieceId)
    {
        var workOrderPiece = await _appDbContext.WorkOrdersPiece
            .FirstOrDefaultAsync(wp => wp.WorkOrderId == workOrderId && wp.PieceId == pieceId);

        if (workOrderPiece == null) return NotFound();
        return Ok(_mapper.Map<ReadWorkOrderPieceDto>(workOrderPiece));
    }

    [HttpPut("{workOrderId}/{pieceId}")]
    public async Task<IActionResult> UpdateWorkOrderPiece(int workOrderId, int pieceId, [FromBody] UpdateWorkOrderPieceDto dto)
    {
        var workOrderPiece = await _appDbContext.WorkOrdersPiece
            .FirstOrDefaultAsync(wp => wp.WorkOrderId == workOrderId && wp.PieceId == pieceId);
        if (workOrderPiece == null) return NotFound();

        _mapper.Map(dto, workOrderPiece);
        await _appDbContext.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{workOrderId}/{pieceId}")]
    public async Task<IActionResult> DeleteWorkOrderPiece(int workOrderId, int pieceId)
    {
        var workOrderPiece = await _appDbContext.WorkOrdersPiece
            .FirstOrDefaultAsync(wp => wp.WorkOrderId == workOrderId && wp.PieceId== pieceId);
        if (workOrderPiece == null) return NotFound();

        _appDbContext.WorkOrdersPiece.Remove(workOrderPiece);
        await _appDbContext.SaveChangesAsync();
        return NoContent();
    }
}
