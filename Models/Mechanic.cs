namespace Car_Repair_Shop.Models;

public class Mechanic
{
    public Mechanic(string name, string specialty, string contact)
    {
        Name = name;
        Specialty = specialty;
        Contact = contact;
    }

    public int Id { get; set; }
    public string Name { get; set; }
    public string Specialty { get; set; }
    public string Contact { get; set; }
    public ICollection<WorkOrder> WorkOrders { get; set; } = new HashSet<WorkOrder>();
}
