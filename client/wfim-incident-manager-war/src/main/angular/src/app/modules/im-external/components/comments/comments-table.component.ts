import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DatePipe } from '@angular/common';
// External
import * as moment from 'moment';
// Redux
import { IncidentCommentResource } from '@wf1/incidents-rest-api';

@Component({
    selector: 'comments-table',
    templateUrl: './comments-table.component.html',
    styleUrls: ['./comments-table.component.scss']
})
export class CommentsTableComponent implements OnInit, OnChanges {
    @Input('comments')
    comments: any[] = [];

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    public dataSource;
    public tableDef: any[] = [];
    public tableHeaders: string[] = [];

    ngOnInit() {
        this.getTableDef();
        this.dataSource = new MatTableDataSource([]);
        this.dataSource.sort = this.sort;
        this.dataSource.sortingDataAccessor = (item, property) => {
            switch (property) {
                case 'enteredTimestamp': return new Date(item.enteredTimestamp);
                default: return item[property];
            }
        };
        this.setData(this.comments);
    }

    ngOnChanges(changes: SimpleChanges) {
        this.setData(changes.comments.currentValue);
    }

    setData(comments) {
        if (comments && comments.length > 0) {
            this.dataSource.data = comments;
            this.dataSource.sort = this.sort;
        }
    }

    getTableDef() {
        this.tableDef = [
            {
                title: 'Author',
                name: 'commenterName',
                prop: (row: IncidentCommentResource) => row.commenterName
            },
            // {
            // 	title: 'Type',
            // 	name: 'type',
            // 	prop: (row: IncidentCommentResource) => row.type
            // },
            {
                title: 'Time',
                name: 'enteredTimestamp',
                prop: (row: IncidentCommentResource) => new DatePipe('en-US').transform(new Date(row.enteredTimestamp), 'MMM d, y, h:mm:ss a')
            },
            {
                title: 'Comment',
                name: 'comment',
                prop: (row: IncidentCommentResource) => row.comment
            }
        ];

        this.tableHeaders = this.tableDef.map(column => column.name);
    }

    formatDate(date: Date, format: string): string {
        return date ? moment(date).format(format) : '';
    }

    formatTime(timestamp: Date): string {
        return moment(timestamp).fromNow();
    }
}
