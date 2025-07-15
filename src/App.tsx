import { useState, useEffect } from 'react';
import { Todo, FilterType } from './types';

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState<string>('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Problema 1: Efeito colateral sem dependências adequadas
  useEffect(() => {
    setIsLoading(true);
    fetch('https://jsonplaceholder.typicode.com/todos')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((data: Todo[]) => {
        setTodos(data.slice(0, 10)); // Limita a 10 itens para exemplo
        setIsLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  // Problema 2: Função não está otimizada (useCallback faltando)
  const addTodo = () => {
    if (!input.trim()) return;
    
    const newTodo: Todo = {
      id: Date.now(), // Problema 3: ID pode não ser único em casos extremos
      title: input,
      completed: false,
    };
    
    setTodos([...todos, newTodo]);
    setInput('');
  };

  // Problema 4: Filtro ineficiente - recalculado em toda renderização
  const filteredTodos = todos.filter(todo => {
    if (filter === 'completed') return todo.completed; // Problema 5: Typo em 'completed'
    if (filter === 'active') return !todo.completed;
    return true;
  });

  // Problema 6: Função de toggle não está otimizada
  const toggleTodo = (id: number) => {
    setTodos(
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  // Problema 7: Componente não está memoizado e pode renderizar desnecessariamente
  const TodoItem = ({ todo, onToggle }: { todo: Todo; onToggle: (id: number) => void }) => {
    return (
      <li className="flex items-center p-2 border-b">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
          className="mr-2"
        />
        <span className={`flex-1 ${todo.completed ? 'line-through text-gray-400' : ''}`}>
          {todo.title}
        </span>
      </li>
    );
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Todo App</h1>
      
      {/* Problema 8: Form sem tratamento acessível */}
      <div className="flex mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-2 border rounded-l"
          placeholder="Add a new todo..."
        />
        <button
          onClick={addTodo}
          className="bg-blue-500 text-white px-4 py-2 rounded-r"
        >
          Add
        </button>
      </div>

      {/* Problema 9: Controles de filtro sem labels acessíveis */}
      <div className="flex space-x-2 mb-4">
        {(['all', 'active', 'completed'] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded ${filter === f ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Problema 10: Gerenciamento de estado de loading/error pode ser melhorado */}
      {isLoading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <ul className="border rounded">
          {filteredTodos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} onToggle={toggleTodo} />
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;