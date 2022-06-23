import {ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {select, Store} from '@ngrx/store';
import {Subscription} from 'rxjs';
// Models
import {IncidentCommentListService, IncidentCommentResource, WildfireIncidentResource} from '@wf1/incidents-rest-api';
import {RootState} from '../../../../store/index';
import {Convert} from "../panel-container/panel/convert";
import * as UIActions from '../../../../store/ui/ui.actions';
import * as uuid from 'uuid';
import {UIReportingService} from "../../../../services/ui-reporting.service";

// Redux


@Component({
	selector: 'comments-container',
	templateUrl: './comments.component.html',
	styleUrls: ['../panel-container/panel/base-panel.component.scss']
})
export class CommentsContainerComponent implements OnInit, OnDestroy, OnChanges {
  @Input('comments')
  comments: any[] = [];
	@Input('incident')
	incident: WildfireIncidentResource;
  private fb: FormBuilder;
  public formGroup : FormGroup;

	public commentsObject: {
		comments: IncidentCommentResource[];
		wildfireYear: number;
		incidentNumberSequence: number;
		pageRowCount?: string;
		orderBy?: string;
		pageNumber?: number;
	};
	private config: any;
	private storeAuthSub: Subscription;


	constructor(
		private store: Store<RootState>,
    private uiReportingService: UIReportingService,
		private commentListService: IncidentCommentListService,
    protected cdr: ChangeDetectorRef
	) { }

	ngOnChanges(changes: SimpleChanges) {
		if (changes.incident) {
			this.initComments();
		}
	}

	ngOnInit() {
    if(!this.formGroup){
      this.formGroup = new FormGroup({
        commentText: new FormControl()
      });
    }
		this.initComments();


		this.storeAuthSub = this.storeAuthSub?this.storeAuthSub:this.store.pipe(select('auth')).subscribe(config => {
			if (config) {
				this.config = config;
			}
		});
	}

	private initComments() {

		this.commentsObject = {
			comments: undefined,
			wildfireYear: undefined,
			incidentNumberSequence: undefined
		};
		this.commentsObject.wildfireYear = this.incident.wildfireYear;
		this.commentsObject.incidentNumberSequence = this.incident.incidentNumberSequence;
		this.getComments(this.commentsObject.wildfireYear, this.commentsObject.incidentNumberSequence);
	}

	public async getComments(wildfireYear: number, incidentNumberSequence: number) {
    //this.store.dispatch(new IncidentActions.IncidentCommentLoadAction(`${wildfireYear}`, `${incidentNumberSequence}`));
		if (this.commentsObject.wildfireYear && this.commentsObject.incidentNumberSequence) {
			try {
				const commentsResponse = await this.commentListService
					.getIncidentCommentList(
						this.commentsObject.wildfireYear.toString(),
						this.commentsObject.incidentNumberSequence.toString(),
            undefined,
            undefined,
            'enteredTimestamp DESC',
          )
					.toPromise();
				this.commentsObject.comments = commentsResponse.collection;
        this.cdr.detectChanges();
			} catch (error) {
			  this.uiReportingService.handleError(error);
			}
		}
	}

	disableAddComment():boolean{
    return !(this.formGroup
      && this.formGroup.controls.commentText
      && this.formGroup.controls.commentText.value
      && this.formGroup.controls.commentText.value.length > 0);
  }

	public async onSubmit() {
		try{
			let commentResource = Convert.commentFormToResource(this.formGroup);
			const comment = await this.commentListService
			.createIncidentComment(this.incident.wildfireYear.toString(),this.incident.incidentNumberSequence.toString(), commentResource)
			.toPromise();

			this.commentsObject.comments = [...this.commentsObject.comments, comment];
		} catch (error) {
			this.store.dispatch(new UIActions.AddError(uuid.v4(), { type: 'comment', data: error }));
		}

		this.formGroup.get("commentText").reset();
			this.formGroup.markAsPristine();

  }

	public onChange(formValues) {
		// console.log('formChange', formValues);
	}

	public onError(err) {
		console.log(err);
	}

	ngOnDestroy() {
		this.storeAuthSub.unsubscribe();
	}
}
