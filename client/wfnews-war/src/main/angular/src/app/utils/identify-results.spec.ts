import { displayWildfireName, firePerimeterStatusLayer, groupIdentifyResults, identifyKind, identifyTitle } from './identify-results';

const item = (layerId: string, properties: any = {}) => ({ layerId, properties });

describe('identify-results', () => {
  describe('groupIdentifyResults', () => {
    it('lists a fire perimeter with the fires', () => {
      const fire = item('active-wildfires-holding');
      const perimeter = item('fire-perimeters');
      expect(groupIdentifyResults([fire, perimeter]).wildfires).toEqual([fire, perimeter]);
    });

    it('puts the three ban categories in one group', () => {
      const bans = ['bans-and-prohibitions-cat1', 'bans-and-prohibitions-cat2', 'bans-and-prohibitions-cat3'].map((id) => item(id));
      expect(groupIdentifyResults(bans).bansAndProhibitions).toEqual(bans);
    });

    it('keeps each item in its own group only', () => {
      const evac = item('evacuation-orders-and-alerts-wms');
      const station = item('weather-stations');
      const results = groupIdentifyResults([evac, station]);
      expect(results.evacs).toEqual([evac]);
      expect(results.weatherStations).toEqual([station]);
      expect(results.wildfires).toEqual([]);
      expect(results.dangerRatings).toEqual([]);
    });

    it('drops a layer that no list shows', () => {
      const results = groupIdentifyResults([item('unknown-layer')]);
      expect(Object.values(results).every((group) => group.length === 0)).toBe(true);
    });
  });

  describe('displayWildfireName', () => {
    it('names a perimeter by its fire number', () => {
      expect(displayWildfireName(item('fire-perimeters', { FIRE_NUMBER: 'C40983' }))).toBe('C40983 Wildfire');
    });

    it('names a fire by its name and number', () => {
      const fire = item('active-wildfires-holding', { incident_name: 'Ross Moore Lake', incident_number_label: 'K20637' });
      expect(displayWildfireName(fire)).toBe('Ross Moore Lake (K20637)');
    });

    it('names a fire with no name by its number', () => {
      expect(displayWildfireName(item('active-wildfires-holding', { incident_number_label: 'K20637' }))).toBe('K20637 Wildfire');
    });
  });

  describe('identifyKind', () => {
    it('opens a fire and its perimeter as a wildfire', () => {
      expect(identifyKind(item('active-wildfires-holding'))).toBe('wildfire');
      expect(identifyKind(item('fire-perimeters'))).toBe('wildfire');
    });

    it('opens an incident from the wildfire list, which has no layer, as a wildfire', () => {
      expect(identifyKind({ incidentNumberLabel: 'K20637', fireYear: 2026 })).toBe('wildfire');
    });

    it('puts every ban category and local authority in one kind', () => {
      expect(identifyKind(item('bans-and-prohibitions-cat3'))).toBe('ban');
      expect(identifyKind(item('fnt-treaty-land'))).toBe('local-authority');
    });

    it('has no kind for an unknown layer', () => {
      expect(identifyKind(item('unknown-layer'))).toBeNull();
    });
  });

  describe('identifyTitle', () => {
    it('names an evacuation by its status and other results by their kind', () => {
      expect(identifyTitle(item('evacuation-orders-and-alerts-wms', { ORDER_ALERT_STATUS: 'Order' }))).toBe('Evacuation Order');
      expect(identifyTitle(item('bans-and-prohibitions-cat1'))).toBe('Fire Bans');
      expect(identifyTitle(item('active-wildfires-fire-of-note'))).toBe('Wildfire of Note');
      expect(identifyTitle(item('unknown-layer'))).toBe('');
    });
  });

  describe('firePerimeterStatusLayer', () => {
    it('gives the fire layer of each perimeter status', () => {
      expect(firePerimeterStatusLayer('Out of Control')).toBe('active-wildfires-out-of-control');
      expect(firePerimeterStatusLayer('Being Held')).toBe('active-wildfires-holding');
      expect(firePerimeterStatusLayer('Under Control')).toBe('active-wildfires-under-control');
      expect(firePerimeterStatusLayer('Out')).toBe('bcws-activefires-publicview-inactive');
      expect(firePerimeterStatusLayer('Unknown')).toBeUndefined();
    });
  });
});
