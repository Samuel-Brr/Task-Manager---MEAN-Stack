import { Injectable } from '@angular/core';
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

  getTasks(listId: string){
    return this.webReqService.get(`lists/${listId}/tasks`)
  }

  createTask(title: string, listId: string){
    return this.webReqService.post(`/lists/${listId}/task`, { title })
  }
}
