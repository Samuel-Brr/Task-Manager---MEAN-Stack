import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TaskService } from 'src/app/services/task.service';
import { Task } from 'src/app/models/task.model';

@Component({
  selector: 'app-new-task',
  templateUrl: './new-task.component.html',
  styleUrls: ['./new-task.component.scss']
})
export class NewTaskComponent implements OnInit {

  listId: string = '62419deba5b8b3721cdcdc03';

  constructor(private taskService: TaskService,
            private route: ActivatedRoute,
            private router: Router) { }

  ngOnInit(): void {

    this.route.params.subscribe(
      (params: Params) => {
        this.listId = params['listId']
      }
    )


  }

  createTask(title: string ){
    this.taskService.createTask(title, this.listId).subscribe((newTask) => {
      this.router.navigate(['../'], {relativeTo: this.route})
    })
  }

}
