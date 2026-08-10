using System.ComponentModel.DataAnnotations;

namespace Car_Repair_Shop.Models;

public class Vehicle
{
    public Vehicle(string plate, string model, string mark, int year, string color, int clientId)
    {
        Plate = plate;
        Model = model;
        Mark = mark;
        Year = year;
        Color = color;
        ClientId = clientId;
    }

    public int Id { get; set; }
    public required string Plate { get; set; }
    public required string Model { get; set; }
    public required string Mark { get; set; }
    public int Year { get; set; }
    public required string Color { get; set; }
    public int ClientId { get; set; }
    public required Client Client { get; set; }
    public ICollection<WorkOrder> WorkOrders { get; set; } = new HashSet<WorkOrder>();
}
