import { Component, OnInit, ViewChild, ElementRef, Input, Renderer2 } from '@angular/core';
import { AfterContentInit } from '@angular/core/src/metadata/lifecycle_hooks';
declare var $: any;
@Component({
  selector: 'app-bootstrap-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class BootstrapModalComponent implements OnInit, AfterContentInit {

  @ViewChild('abstractmodal') private modal: ElementRef;
  @Input('id') private modalId: string;/**[REQUIERD] */
  @Input('class') private modalClass: string;/**[OPTINAL] */
  @Input('autoCloseTime') private closeTime: number | null = null;/**[OPTINAL] */

  constructor(private renderer: Renderer2) { }
  ngOnInit() {

  }
  ngAfterContentInit() {
    //Dom manipulation in angular : https://www.youtube.com/watch?v=uwHE67T8NfM&index=3&list=PLHAiE6FK2d8YPfKOX5a7SaXU6Dn4myc1I (without touch directly in the Dom)
    /**
     * The Renderer2 class is an abstraction provided by Angular in the form of a service that allows to manipulate elements of your app without having to touch the DOM directly. 
     * This is the recommended approach because it then makes it easier to develop apps that can be rendered in environments that don’t have DOM access, like on the server, in a web worker or on native mobile. (https://alligator.io/angular/using-renderer2/)
     */
    const nativeElModal = this.modal.nativeElement;
    this.renderer.addClass(nativeElModal, this.modalClass);
    this.renderer.setProperty(nativeElModal, 'id', this.modalId);

    //detect when modal is open and close it utomatically if 'autoCloseTime' specified

    if (this.closeTime) {
      $(`#${this.modalId}`).on('shown.bs.modal', () => {
        setTimeout(() => {
          this.closeModal();
        }, this.closeTime);
      });
    }
  }
  openModal() {
    let modal: any = $(`#${this.modalId}`);
    console.log(modal);
    modal.modal('show');//https://www.w3schools.com/bootstrap/bootstrap_ref_js_modal.asp
  }
  closeModal() {
    let modal: any = $(`#${this.modalId}`);
    modal.modal('hide');//https://www.w3schools.com/bootstrap/bootstrap_ref_js_modal.asp
  }

}
