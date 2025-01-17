import i18n, { default as I18n } from 'i18n-js';
import { Container, Spinner } from 'native-base';
import React from 'react';
import { View } from 'react-native';

import HeaderComponent from '../../components/header/HeaderComponent';
import ItemsList from '../../components/list/ItemsList';
import SimpleSearchComponent from '../../components/search/simple/SimpleSearchComponent';
import TagComponent from '../../components/tag/TagComponent';
import { DataResult } from '../../types/DataResult';
import { HTTPAuthError } from '../../types/HTTPError';
import Tag from '../../types/Tag';
import Constants from '../../utils/Constants';
import Utils from '../../utils/Utils';
import SelectableList, { SelectableProps, SelectableState } from '../base-screen/SelectableList';
import computeStyleSheet from './TagsStyles';

export interface Props extends SelectableProps<Tag> {
  userIDs?: string[];
  disableInactive?: boolean;
  sorting?: string;
}

interface State extends SelectableState<Tag> {
  tags?: Tag[];
  projectFields?: string[];
  skip?: number;
  limit?: number;
  count: number;
  refreshing?: boolean;
  loading?: boolean;
}

export default class Tags extends SelectableList<Tag> {
  public state: State;
  public props: Props;
  private searchText: string;

  public constructor(props: Props) {
    super(props);
    this.selectMultipleTitle = 'tags.selectTags';
    this.selectSingleTitle = 'tags.selectTag';
    this.singleItemTitle = I18n.t('tags.tag');
    this.multiItemsTitle = I18n.t('tags.tags');
    this.state = {
      projectFields: [],
      tags: [],
      skip: 0,
      limit: Constants.PAGING_SIZE,
      count: 0,
      refreshing: false,
      loading: true,
      selectedItems: []
    };
  }

  public async componentDidMount(): Promise<void> {
    await super.componentDidMount();
    await this.refresh();
  }

  public setState = (
    state: State | ((prevState: Readonly<State>, props: Readonly<Props>) => State | Pick<State, never>) | Pick<State, never>,
    callback?: () => void
  ) => {
    super.setState(state, callback);
  };

  public async getTags(searchText: string, skip: number, limit: number): Promise<DataResult<Tag>> {
    const { sorting } = this.props;
    try {
      const params = {
        Search: searchText,
        WithUser: true,
        UserID: this.props.userIDs?.join('|')
      };
      // Get the Tags
      const tags = await this.centralServerProvider.getTags(params, { skip, limit }, [sorting ?? '-createdOn']);
      // Get total number of records
      if (tags?.count === -1) {
        const tagsNbrRecordsOnly = await this.centralServerProvider.getTags(params, Constants.ONLY_RECORD_COUNT);
        tags.count = tagsNbrRecordsOnly?.count;
      }
      return tags;
    } catch (error) {
      // Check if HTTP?
      if (!error.request || error.request.status !== HTTPAuthError.FORBIDDEN) {
        await Utils.handleHttpUnexpectedError(
          this.centralServerProvider,
          error,
          'transactions.transactionUnexpectedError',
          this.props.navigation,
          this.refresh.bind(this)
        );
      }
    }
    return null;
  }


  public onEndScroll = async () => {
    const { count, skip, limit } = this.state;
    // No reached the end?
    if (skip + limit < count || count === -1) {
      // No: get next sites
      const tags = await this.getTags(this.searchText, skip + Constants.PAGING_SIZE, limit);
      // Add sites
      this.setState((prevState) => ({
        projectFields: tags ? tags.projectFields : [],
        tags: tags ? [...prevState.tags, ...tags.result] : prevState.tags,
        skip: prevState.skip + Constants.PAGING_SIZE,
        refreshing: false
      }));
    }
  };

  public async refresh(): Promise<void> {
    if (this.isMounted()) {
      const { skip, limit } = this.state;
      // Refresh All
      const tags = await this.getTags(this.searchText, 0, skip + limit);
      // Set
      this.setState({
        loading: false,
        refreshing: false,
        tags: tags ? tags.result : [],
        projectFields: tags ? tags.projectFields : [],
        count: tags ? tags.count : 0
      });
    }
  }

  public search = async (searchText: string) => {
    this.setState({ refreshing: true });
    this.searchText = searchText;
    await this.refresh();
  };

  public render = () => {
    const style = computeStyleSheet();
    const { tags, count, skip, limit, refreshing, loading, projectFields } = this.state;
    const { navigation, isModal, selectionMode } = this.props;
    return (
      <Container style={style.container}>
        <HeaderComponent
          title={this.buildHeaderTitle()}
          subTitle={this.buildHeaderSubtitle()}
          modalized={isModal}
          backArrow={!isModal}
          navigation={this.props.navigation}
          displayTenantLogo={false}
        />
        <View style={style.searchBar}>
          <SimpleSearchComponent onChange={async (searchText) => this.search(searchText)} navigation={navigation} />
        </View>
        {loading ? (
          <Spinner style={style.spinner} color="grey" />
        ) : (
          <View style={style.content}>
            <ItemsList<Tag>
              data={tags}
              ref={this.itemsListRef}
              navigation={navigation}
              disableItem={(item: Tag) => !item.active}
              onSelect={this.onItemsSelected.bind(this)}
              selectionMode={selectionMode}
              count={count}
              limit={limit}
              skip={skip}
              renderItem={(item: Tag, selected: boolean) => (
                <TagComponent
                  tag={item}
                  canReadUser={projectFields?.includes('user.name') && projectFields?.includes('user.firstName')}
                  selected={selected}
                  navigation={navigation}
                />
              )}
              refreshing={refreshing}
              manualRefresh={this.manualRefresh}
              onEndReached={this.onEndScroll}
              emptyTitle={i18n.t('tags.noTags')}
            />
          </View>
        )}
      </Container>
    );
  };
}
