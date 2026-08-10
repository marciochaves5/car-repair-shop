using System.ComponentModel.DataAnnotations;

namespace Car_Repair_Shop.Models;

public class Client
{
    public Client(string name, string cpf, string contact)
    {
        Name = name;
        Cpf = cpf;
        Contact = contact;
    }

    
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Cpf { get; set; }
    public required string Contact { get; set; }
    public string? Email { get; set; }
    public ICollection<Vehicle> Vehicles { get; set; } = new HashSet<Vehicle>();
    public ICollection<WorkOrder> WorkOrders { get; set; } = new HashSet<WorkOrder>();
}
