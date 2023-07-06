import {Subject} from "rxjs";

export class FakeActivatedRoute {
    queryParams = new Subject<any>();
    paramMap = new Subject<any>();
}
