# App-Modal
#### **purpose** - reusable modal for all over the app using bootstrap modals
the modal can contain any data and can be toggled and auto closed
## how to use:
> ###  Requierd Props

-  **[id]** - modal id 
> ###  Optinal Props

-  **[class]** - modal class
-  **[autoCloseTime]** - can cause modal to be auto closed after certain time 
(in miliseconds)
> ### Component Api (if using @ViewChild Or Template Variable)
- openModal() 
- closeModal()
Exmaple:
> ### AppComponent html
``` html
this modal will be automatically closed each time it get opens after 1 sec
<app-modal #myModal [id]="'someId'" [class]="'someClass'" [autoCloseTime]="1000">
   <div class="modal-header">
            this is modal header content
    </div>
    <div class="modal-body">
            this is modal body content
    </div>
    <div class="modal-footer">
            this is modal footer content
    </div>
</app-modal>

//all buttons will open the modal
#1 formal boostrap modal open button
<button type="button" class="btn btn-info btn-lg" data-toggle="modal" data-target="#someId">Open Modal</button>
#2 get Ref with ViewChild in the App.ts
<button type="button" class="btn btn-info btn-lg" (click)="openMyModal()">Open Modal</button>
#3 using Template Var
<button type="button" class="btn btn-info btn-lg" (click)="myModal.openModal()">Open Modal</button>
```
>### AppComponent ts.
```ts
export class AppComponent implements OnInit{
  @ViewChild('myModal') modal: ElementRef;

  private title = 'app';
  //for button 2
  openMyModal(){
      this.modal.openModal();
  }
  ngOnInit(){

  }
}
```



