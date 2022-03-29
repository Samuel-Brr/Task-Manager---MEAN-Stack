import { Injectable } from '@angular/core';
import { Task } from '../models/task.model';
import { WebRequestsService } from './web-requests.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(private webReqService: WebRequestsService) { }

  getLists(){
    return this.webReqService.get('lists')
  }

  createList(title: string){
    return this.webReqService.post('lists', { title })
  }

  updateList(id: string, title: string) {
    // We want to send a web request to update a list
    return this.webReqService.patch(`lists/${id}`, { title });
  }

  updateTask(listId: string, taskId: string, title: string) {
    // We want to send a web request to update a list
    return this.webReqService.patch(`lists/${listId}/task/${taskId}`, { title });
  }

  deleteTask(listId: string, taskId: string) {
    return this.webReqService.delete(`lists/${listId}/task/${taskId}`);
  }

  deleteList(id: string) {
    return this.webReqService.delete(`lists/${id}`);
  }

  getTasks(listId: string){
    return this.webReqService.get(`lists/${listId}/tasks`)
  }

  createTask(title: string, listId: string){
    return this.webReqService.post(`lists/${listId}/task`, { title })
  }

  complete(task: Task){
    return this.webReqService.patch(`lists/${task._listId}/task/${task._id}`, {
      completed: !task.completed
    })
  }
}
