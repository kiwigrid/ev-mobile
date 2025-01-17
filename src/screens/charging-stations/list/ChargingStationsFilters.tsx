import I18n from 'i18n-js';
import { View } from 'native-base';
import React from 'react';
import * as Animatable from 'react-native-animatable';

import FilterVisibleContainerComponent from '../../../components/search/filter/containers/FilterVisibleContainerComponent';
import ConnectorTypeFilterControlComponent from '../../../components/search/filter/controls/connector-type/ConnectorTypeFilterControlComponent';
import computeControlStyleSheet from '../../../components/search/filter/controls/FilterControlComponentStyles';
import OnlyAvailableChargingStationSwitchFilterControlComponent from '../../../components/search/filter/controls/only-available-charging-station-switch/OnlyAvailableChargingStationSwitchFilterControlComponent';
import ScreenFilters, { ScreenFiltersState } from '../../../components/search/filter/screen/ScreenFilters';
import { ChargePointStatus } from '../../../types/ChargingStation';
import { GlobalFilters } from '../../../types/Filter';
import computeStyleSheet from './ChargingStationsStyles';

export interface Props {
  onFilterChanged?: (filters: ChargingStationsFiltersDef) => void;
  initialFilters?: ChargingStationsFiltersDef;
}

interface State extends ScreenFiltersState {
  filters?: ChargingStationsFiltersDef;
}

export interface ChargingStationsFiltersDef {
  connectorStatus?: ChargePointStatus;
  connectorType?: string;
}

export default class ChargingStationsFilters extends ScreenFilters {
  public state: State;
  public props: Props;

  public constructor(props: Props) {
    super(props);
    this.state = {
      filters: {}
    };
  }

  public setState = (
    state: State | ((prevState: Readonly<State>, props: Readonly<Props>) => State | Pick<State, never>) | Pick<State, never>,
    callback?: () => void
  ) => {
    super.setState(state, callback);
  };

  public onFilterChanged = (newFilters: ChargingStationsFiltersDef) => {
    const { onFilterChanged } = this.props;
    this.setState(
      {
        filters: { ...this.state.filters, ...newFilters }
      },
      () => onFilterChanged(this.state.filters)
    );
  };

  public render = () => {
    const { initialFilters } = this.props;
    const { filters } = this.state;
    const style = computeStyleSheet();
    const controlStyle = computeControlStyleSheet();
    return (
      <View>
        <FilterVisibleContainerComponent
          onExpand={(expanded: boolean) => this.setViewExpanded(expanded, style.filtersHidden, style.filtersExpanded)}
          onFilterChanged={this.onFilterChanged}
          ref={(filterVisibleContainerComponent: FilterVisibleContainerComponent) =>
            this.setFilterVisibleContainerComponent(filterVisibleContainerComponent)
          }>
          <OnlyAvailableChargingStationSwitchFilterControlComponent
            filterID={'connectorStatus'}
            internalFilterID={GlobalFilters.ONLY_AVAILABLE_CHARGING_STATIONS}
            initialValue={filters.hasOwnProperty('connectorStatus') ? filters.connectorStatus : initialFilters.connectorStatus}
            label={I18n.t('general.onlyAvailableChargers')}
            onFilterChanged={async (id: string, value: ChargePointStatus) => this.getFilterVisibleContainerComponent().setFilter(id, value)}
            ref={async (
              onlyAvailableChargingStationSwitchFilterControlComponent: OnlyAvailableChargingStationSwitchFilterControlComponent
            ) => this.addVisibleFilter(onlyAvailableChargingStationSwitchFilterControlComponent)}
          />
          <Animatable.View style={style.filtersHidden} ref={this.setExpandableView}>
            <ConnectorTypeFilterControlComponent
              filterID={'connectorType'}
              internalFilterID={GlobalFilters.CONNECTOR_TYPES}
              initialValue={filters.hasOwnProperty('connectorType') ? filters.connectorType : initialFilters.connectorType}
              style={controlStyle.rowFilterWithBorder}
              label={I18n.t('details.connectors')}
              onFilterChanged={async (id: string, value: ChargePointStatus) =>
                this.getFilterVisibleContainerComponent().setFilter(id, value)
              }
              ref={async (connectorTypeFilterControlComponent: ConnectorTypeFilterControlComponent) =>
                this.addVisibleFilter(connectorTypeFilterControlComponent)
              }
            />
          </Animatable.View>
        </FilterVisibleContainerComponent>
      </View>
    );
  };
}
