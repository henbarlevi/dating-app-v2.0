import { Component, OnInit, ElementRef, ViewChild, Input, Renderer2, AfterContentInit } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit, AfterContentInit {

  @ViewChild('abstractModal') private modal: ElementRef;
  @ViewChild('abstractModalContent') private modalContent: ElementRef;

  @Input('id') private modalId: string;/**[OPTIONAL] */
  @Input('class') private modalClass: string;/**[OPTINAL] */
  @Input('autoCloseTime') private closeTime: number | null = null;/**[OPTINAL] */
  @Input('location') private location: string | null = null;/**[OPTINAL] */

  constructor(private renderer: Renderer2) { }

  ngOnInit() {

    // When the user clicks anywhere outside of the modal, close it
    this.renderer.listen('window', 'click', (event) => {
      if (event.target == this.modal.nativeElement) {
        this.closeModal();
      }
    })
  }
  ngAfterContentInit() {
    //Dom manipulation in angular : https://www.youtube.com/watch?v=uwHE67T8NfM&index=3&list=PLHAiE6FK2d8YPfKOX5a7SaXU6Dn4myc1I (without touch directly in the Dom)
    /**
     * The Renderer2 class is an abstraction provided by Angular in the form of a service that allows to manipulate elements of your app without having to touch the DOM directly. 
     * This is the recommended approach because it then makes it easier to develop apps that can be rendered in environments that don’t have DOM access, like on the server, in a web worker or on native mobile. (https://alligator.io/angular/using-renderer2/)
     */
    const nativeElModal = this.modal.nativeElement;
    if (this.modalClass) {
      this.renderer.addClass(nativeElModal, this.modalClass);
    }
    if (this.modalClass) {
      this.renderer.setProperty(nativeElModal, 'id', this.modalId);
    }
    //set modal location appearence if [location] specified
    if (this.location) {
      this.setModalLocation(this.location);
    }
  }
  openModal() {
    const nativeElModal = this.modal.nativeElement;
    this.renderer.setStyle(nativeElModal, 'display', 'block');
    // if 'autoCloseTime' specified - close modal automatically
    if (this.closeTime) {
      setTimeout(() => {
        this.closeModal();
      }, this.closeTime);
    }
  }
  closeModal() {
    const nativeElModal = this.modal.nativeElement;
    this.renderer.setStyle(nativeElModal, 'display', 'none');
  }
  /**declare where the modal apear when it opened (top/center/bottom)
   * depend on the @param location:string
   */
  setModalLocation(location: string): any {
    //// This is equivalent to document.querySelector("input")
    const nativeModalContent = this.modalContent.nativeElement;
    if (location === 'middle') {
      this.renderer.addClass(nativeModalContent, 'location-middle');
    } else if (location === 'bottom') {
      this.renderer.addClass(nativeModalContent, 'location-bottom');

    }
  }

}
