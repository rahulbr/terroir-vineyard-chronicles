
import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import { tasks, vineyardBlocks } from '@/data/mockData';
import { TaskItem } from '@/types';

const Tasks = () => {
  const [filteredTasks, setFilteredTasks] = useState<TaskItem[]>(tasks);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);

  const handleFilterChange = (category: string | null, blockId: string | null) => {
    setSelectedCategory(category);
    setSelectedBlock(blockId);
    
    let filtered = [...tasks];
    
    if (category) {
      filtered = filtered.filter(task => task.category === category);
    }
    
    if (blockId) {
      filtered = filtered.filter(task => task.blockId === blockId);
    }
    
    setFilteredTasks(filtered);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">
            Manage and track vineyard tasks
          </p>
        </div>
        
        <TaskFilters 
          blocks={vineyardBlocks}
          onFilterChange={handleFilterChange}
          selectedCategory={selectedCategory}
          selectedBlock={selectedBlock}
        />
        
        <TaskList tasks={filteredTasks} blocks={vineyardBlocks} />
      </div>
    </AppLayout>
  );
};

export default Tasks;
