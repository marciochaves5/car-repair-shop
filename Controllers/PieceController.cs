using AutoMapper;
using Car_Repair_Shop.Data;
using Car_Repair_Shop.Data.Dtos.PieceDto;
using Car_Repair_Shop.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Car_Repair_Shop.Controllers;

[ApiController]
[Route("[controller]")]
public class PieceController : ControllerBase
{
    private readonly IMapper _mapper;
    private readonly AppDbContext _appDbContext;

    public PieceController(IMapper mapper, AppDbContext appDbContext)
    {
        _mapper = mapper;
        _appDbContext = appDbContext;
    }

    [HttpPost]
    public async Task<IActionResult> CreatePiece([FromBody] CreatePieceDto dto)
    {
        var piece = _mapper.Map<Piece>(dto);
        _appDbContext.Pieces.Add(piece);
        await _appDbContext.SaveChangesAsync();

        var readPiece = _mapper.Map<ReadPieceDto>(piece);
        return CreatedAtAction(nameof(GetPieceById), new { piece.Id }, readPiece);
    }

    [HttpGet]
    public async Task<IActionResult> GetAllPieces([FromQuery] int skip = 0, [FromQuery] int take = 20)
    {
        var pieces = await _appDbContext.Pieces
            .Skip(skip)
            .Take(take)
            .ToListAsync();
        return Ok(_mapper.Map<List<ReadPieceDto>>(pieces));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetPieceById(int id)
    {
        var piece = await _appDbContext.Pieces.FirstOrDefaultAsync(p => p.Id == id);
        if (piece == null) return NotFound();
        return Ok(_mapper.Map<ReadPieceDto>(piece));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePiece(int id, [FromBody] UpdatePieceDto dto)
    {
        var piece = await _appDbContext.Pieces.FirstOrDefaultAsync(p => p.Id == id);
        if (piece == null) return NotFound();

        _mapper.Map(dto, piece);
        await _appDbContext.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePiece (int id)
    {
        var piece = await _appDbContext.Pieces.FirstOrDefaultAsync(p => p.Id == id);
        if (piece == null) return NotFound();

        _appDbContext.Pieces.Remove(piece);
        await _appDbContext.SaveChangesAsync();
        return NoContent();
    }
}
