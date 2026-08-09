using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Text;

namespace Car_Repair_Shop.Models;

public class ApplicationUser : IdentityUser
{
    public int? MechanicId { get; set; }
    public Mechanic? Mechanic { get; set; }

    public int? ClientId { get; set; }
    public Client? Client { get; set; }
}
