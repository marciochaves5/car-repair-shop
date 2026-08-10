namespace Car_Repair_Shop.Data.Dtos.PieceDto;

public class CreatePieceDto
{
    public required string Name { get; set; }
    public int Quantity { get; set; }
    public decimal Price { get; set; }
}
