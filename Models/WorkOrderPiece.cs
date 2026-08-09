namespace Car_Repair_Shop.Models;

public class WorkOrderPiece
{
    public int WorkOrderId { get; set; }
    public WorkOrder WorkOrder { get; set; }
    public int PieceId { get; set; }
    public Piece Piece { get; set; }
    public int QuantityUsed { get; set; }
    public ICollection<WorkOrderPiece> Pieces { get; set; } = new HashSet<WorkOrderPiece>();
}
