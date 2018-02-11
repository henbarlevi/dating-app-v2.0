# App-Modal
#### **purpose** - reusable modal for all over the app using bootstrap modals
the modal can contain any data and can be toggled and auto closed
* <small>( Recommended more then the abstract boostrap modal, this modal use only renderer without Jquery which make it cross platform even on native mobile devicce</small>
## how to use:
> ###  Requierd Props
> NONE
> ###  Optinal Props
-  **[id]** - modal id 

-  **[class]** - modal class
-  **[autoCloseTime]** - can cause modal to be auto closed after certain time 
(in miliseconds)
-  **[location]** - apperance location of the modal, possible values : 'top'/'middle'/'bottom' (string)

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

//both buttons will open the modal
#1 get Ref with ViewChild in the App.ts
<button type="button" class="btn btn-info btn-lg" (click)="openMyModal()">Open Modal</button>
#2 using Template Var
<button type="button" class="btn btn-info btn-lg" (click)="myModal.openModal()">Open Modal</button>

```
>### AppComponent ts.
```ts
export class AppComponent implements OnInit{
  @ViewChild('myModal') modal: ElementRef;

  private title = 'app';
  //for button 1
  openMyModal(){
        this.modal.openModal();
  }
  ngOnInit(){

  }
}
```



