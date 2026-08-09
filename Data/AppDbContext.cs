using Car_Repair_Shop.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace Car_Repair_Shop.Data;

public class AppDbContext : IdentityDbContext<ApplicationUser>
{
    public AppDbContext(DbContextOptions<AppDbContext>opts) : base(opts)
    {
        
    }

    public DbSet<Client> Clients { get; set; }
    public DbSet<Mechanic> Mechanics { get; set; }
    public DbSet<Piece> Pieces { get; set; }
    public DbSet<Vehicle> Vehicles { get; set; }
    public DbSet<WorkOrder> WorkOrders { get; set; }
    public DbSet<WorkOrderPiece> WorkOrdersPiece { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<WorkOrderPiece>()
            .HasKey(wp => new { wp.WorkOrderId, wp.PieceId });

        builder.Entity<WorkOrderPiece>()
            .HasOne(wp => wp.WorkOrder)
            .WithMany(wp => wp.Pieces)
            .HasForeignKey(wp => wp.WorkOrderId);

        builder.Entity<WorkOrderPiece>()
            .HasOne(wp => wp.Piece)
            .WithMany(wp => wp.WorkOrders)
            .HasForeignKey(wp => wp.PieceId);

        builder.Entity<WorkOrder>()
            .HasOne(w => w.Client)
            .WithMany(c => c.WorkOrders)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<WorkOrder>()
            .HasOne(w => w.Vehicle)
            .WithMany(v => v.WorkOrders)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<WorkOrder>()
            .HasOne(w => w.Mechanic)
            .WithMany(m => m.WorkOrders)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
