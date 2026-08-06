namespace Car_Repair_Shop.Models;

public class WorkOrder
{
    public WorkOrder(int number, Client client, Vehicle vehicle, Mechanic mechanic, string problemDescription, string service, DateTime entryDate)
    {
        Number = number;
        Client = client;
        Vehicle = vehicle;
        Mechanic = mechanic;
        ProblemDescription = problemDescription;
        Service = service;
        EntryDate = entryDate;
    }

    public int Id { get; set; }
    public int Number { get; set; }
    public int ClientId { get; set; }
    public Client Client { get; set; }
    public int VehicleId { get; set; }
    public Vehicle Vehicle { get; set; }
    public int MechanicId { get; set; }
    public Mechanic Mechanic { get; set; }
    public string ProblemDescription { get; set; }
    public string Service { get; set; }
    public DateTime EntryDate { get; set; }
    public DateTime? DepartureDate { get; set; }
    public decimal Value { get; set; }
    public WorkOrderStatus Status { get; set; }
    public ICollection<WorkOrderPiece> Pieces { get; set; }
}
