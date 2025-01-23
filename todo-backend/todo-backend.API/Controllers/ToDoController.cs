using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using todo_backend.API;
using todo.API.DAL;

namespace todo.API.Controllers;

    [ApiController]
    [Route("api/[controller]")]
    public class TodoController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<TodoController> _logger;

        public TodoController(ApplicationDbContext context, ILogger<TodoController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Todo>>> GetAllTodos(
            [FromQuery] string? description, 
            [FromQuery] DateTime? dueAt, 
            [FromQuery] bool? isDone,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 50,
            [FromQuery] int? parentTodoId = null
        )
        {
            IQueryable<Todo> todosQuery = _context.Todos;

            if (!string.IsNullOrEmpty(description))
            {
                todosQuery = todosQuery.Where(t => EF.Functions.Like(t.Description, $"%{description}%"));
            }

            if (dueAt.HasValue)
            {
                todosQuery = todosQuery.Where(t => t.DueAt == DateOnly.FromDateTime(dueAt.Value));
            }

            if (isDone.HasValue)
            {
                todosQuery = todosQuery.Where(t => t.isDone == isDone.Value);
            }

            var pagedTodos = await todosQuery
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
            
            return Ok(pagedTodos);
        }

        [HttpPost]
        public async Task<ActionResult<Todo>> CreateTodo(Todo todo, int? parentId = null)
        {
            
            if (parentId.HasValue)
            {
                var parentTodo = await _context.Todos.FindAsync(parentId.Value);
                
                
                if (parentTodo == null)
                {
                    return NotFound("Parent Todo not found.");
                }
                
                todo.ParentId = parentTodo.Id;
            }

            todo.CreatedAt = DateOnly.FromDateTime(DateTime.Now);
            _context.Todos.Add(todo);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTodoById), new { id = todo.Id }, todo);
        }
        
        [HttpGet("{id}")]
        public async Task<ActionResult<Todo>> GetTodoById(int id)
        {
            var todo = await _context.Todos
                .FirstOrDefaultAsync(t => t.Id == id);

            if (todo == null)
            {
                return NotFound();
            }

            var childTodos = await _context.Todos
                .Where(t => t.ParentId == id)
                .ToListAsync();

            var result = new
            {
                Todo = todo,
                ChildTodos = childTodos
            };

            return Ok(result);
        }



        [HttpPut("{id}")]
        public async Task<IActionResult> PutTodo(int id, Todo todo)
        {
            if (id != todo.Id)
            {
                return BadRequest("ID mismatch");
            }

            _context.Entry(todo).State = EntityState.Modified;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTodo(int id)
        {
            var todo = await _context.Todos.FindAsync(id);
            if (todo == null)
            {
                return NotFound();
            }

            _context.Todos.Remove(todo);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        
    }
