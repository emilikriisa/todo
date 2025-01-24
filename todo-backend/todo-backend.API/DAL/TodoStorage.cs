using Microsoft.EntityFrameworkCore;
using todo_backend.API;
using todo_backend.API.Models;

namespace todo.API.DAL;

public class TodoStorage(ApplicationDbContext context)
{
    private const int DefaultPageNumber = 1;
    private const int DefaultPageSize = 50;

    public async Task<List<Todo>> GetAllTodos(
        string? description,
        DateTime? dueAt,
        bool? isDone
    )
    {
        IQueryable<Todo> todosQuery = context.Todos;

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
            todosQuery = todosQuery.Where(t => t.IsDone == isDone.Value);
        }

        return await todosQuery
            .Skip((DefaultPageNumber - 1) * DefaultPageSize)
            .Take(DefaultPageSize)
            .ToListAsync();
    }

    public async Task<Todo?> GetTodoById(int id)
    {
        return await context.Todos.FirstOrDefaultAsync(t => t.Id == id);
    }

    public async Task<List<Todo>> GetChildTodos(int parentId)
    {
        return await context.Todos
            .Where(t => t.ParentId == parentId)
            .ToListAsync();
    }

    public async Task<Todo> CreateTodo(Todo todo, int? parentId = null)
    {
        if (parentId.HasValue)
        {
            var parentTodo = await context.Todos.FindAsync(parentId.Value);
            if (parentTodo == null)
            {
                throw new ArgumentException("Parent Todo not found.");
            }
            todo.ParentId = parentTodo.Id;
        }

        todo.CreatedAt = DateOnly.FromDateTime(DateTime.Now);
        context.Todos.Add(todo);
        await context.SaveChangesAsync();

        return todo;
    }

    public async Task UpdateTodo(Todo todo)
    {
        context.Entry(todo).State = EntityState.Modified;
        await context.SaveChangesAsync();
    }

    public async Task<bool> DeleteTodo(int id)
    {
        var todo = await context.Todos.FindAsync(id);
        if (todo == null)
        {
            return false;
        }

        context.Todos.Remove(todo);
        await context.SaveChangesAsync();

        return true;
    }
}
