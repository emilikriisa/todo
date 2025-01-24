using Microsoft.AspNetCore.Mvc;
using todo_backend.API.Models;
using todo.API.DAL;

namespace todo.API.Controllers;

    [ApiController]
    [Route("api/[controller]")]
    public class TodoController(ILogger<TodoController> logger, TodoStorage todoStorage) : ControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Todo>>> GetAllTodos(
            [FromQuery] string? description, 
            [FromQuery] DateTime? dueAt, 
            [FromQuery] bool? isDone
        )
        {
            try
            {
                var todos = await todoStorage.GetAllTodos(description, dueAt, isDone);
                return Ok(todos);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error retrieving todos");
                return StatusCode(500, "An error occurred while retrieving todos");
            }
        }

        [HttpPost]
        public async Task<ActionResult<Todo>> CreateTodo([FromBody] Todo todo, [FromQuery] int? parentId = null)
        {
            try
            {
                var createdTodo = await todoStorage.CreateTodo(todo, parentId);
                return CreatedAtAction(nameof(GetTodoById), new { id = createdTodo.Id }, createdTodo);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error creating todo");
                return StatusCode(500, "An error occurred while creating the todo");
            }
        }
        
        [HttpGet("{id:int}")]
        public async Task<ActionResult<Todo>> GetTodoById(int id)
        {
            var todo = await todoStorage.GetTodoById(id);
            if (todo == null)
            {
                return NotFound();
            }

            var childTodos = await todoStorage.GetChildTodos(id);

            var result = new
            {
                Todo = todo,
                ChildTodos = childTodos
            };

            return Ok(result);
        }



        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateTodo(int id, Todo todo)
        {
            try
            {
                await todoStorage.UpdateTodo(todo);
                return NoContent();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error updating todo");
                return StatusCode(500, "An error occurred while updating the todo");
            }
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteTodo(int id)
        {
            try
            {
                var isDeleted = await todoStorage.DeleteTodo(id);
                if (!isDeleted)
                {
                    return NotFound();
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error deleting todo");
                return StatusCode(500, "An error occurred while deleting the todo");
            }
        }
        
    }
