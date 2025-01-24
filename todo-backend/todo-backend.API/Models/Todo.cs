using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace todo_backend.API.Models;

public class Todo
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }
    
    [Required]
    public DateOnly CreatedAt { get; set; }
    
    [Required]
    public DateOnly DueAt { get; set; }

    [Required] 
    [MaxLength(100)]
    public string Description { get; set; } = "";
    
    [Required]
    public bool IsDone { get; set; }
    
    public int? ParentId { get; set; }

    [ForeignKey("ParentId")]
    public Todo? Parent { get; set; }
}