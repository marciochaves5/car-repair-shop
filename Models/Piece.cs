namespace Car_Repair_Shop.Models;

public class Piece
{
    public Piece(string name, int quantity, decimal price)
    {
        Name = name;
        Quantity = quantity;
        Price = price;
    }

    public int Id { get; set; }
    public string Name { get; set; }
    public int Quantity { get; set; }
    public decimal Price { get; set; }
    public ICollection<WorkOrderPiece> WorkOrders { get; set; } = new HashSet<WorkOrderPiece>();
}
