using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace todo_backend.API;

public class Todo
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }
    public DateOnly CreatedAt { get; set; }
    public DateOnly DueAt { get; set; }
    public string Description { get; set; }
    public bool isDone { get; set; }
    
    public int? ParentId { get; set; }

    [ForeignKey("ParentId")]
    public Todo? Parent { get; set; }
}