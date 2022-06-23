import {WildfireIncidentResource} from '@wf1/incidents-rest-api';

export class SelectableWildfireIncidentResource {
  public isSelected: boolean = false;
  public displayIncidentType = '';
  public displayStageOfControl = '';
  public displayIncidentLocation = '';
  public displayGeographicDescription = '';
  public displaySiteAccessPointType = '';
  public displayDiscoveryDate = '';
  public displayIncidentStatus = '';
  public displayFireOutDate = '';
  public displayInterface = '';
  public displaySimplexRadioFrequency;
  public displayDuplexRadioFrequency;
  public displayApprovalSignatureDate;
  public displaySignOffSignatureDate;
  constructor(public incidentResource: WildfireIncidentResource) {
  }
}
