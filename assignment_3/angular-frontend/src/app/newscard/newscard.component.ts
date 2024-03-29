import { Component, Input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { faXTwitter, faFacebook} from '@fortawesome/free-brands-svg-icons';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

interface News {
  source: any;
  publishedDate: any;
  title: any;
  description: any;
  url: any;
  image: any;
  datetime: any;
  headline: any;
  summary: any;
}

interface NewsList {
  news: News[];
}

@Component({
  selector: 'app-newscard',
  standalone: true,
  imports: [FaIconComponent, DatePipe],
  templateUrl: './newscard.component.html',
  styleUrl: './newscard.component.css'
})
export class NewsCardComponent {
  @Input() news!: News;
  icon1 = faXTwitter;
  icon2 = faFacebook;

  constructor(public activeModal: NgbActiveModal, library: FaIconLibrary){
    library.addIcons(faXTwitter);
  }

  closeModal() {
    this.activeModal.dismiss();
  }

}