import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  type ColDef,
  type GridReadyEvent,
  type IServerSideDatasource,
  type RowSelectionOptions,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { FakeServer } from './FakeServer';
import { Button, Checkbox } from '@mui/material';
import { SelectionProvider, useSelection } from './SelectionContext';
export interface IOlympicDataWithId extends IOlympicData {
  id: number;
}

export interface IOlympicData {
  athlete: string;
  age: number;
  country: string;
  year: number;
  date: string;
  sport: string;
  gold: number;
  silver: number;
  bronze: number;
  total: number;
}

const AllCheckbox: React.FC<any> = (props) => {
  const {
    isSelected,
    selectGroup: select,
    unselectGroup: unselectAll,
  } = useSelection<IOlympicDataWithId>();
  const nodes = (props.api.getRenderedNodes() || []).filter(
    (node) => !!node.data
  );
  console.log(nodes);
  const allSelected = nodes.reduce(
    (isAllSelected, node) => isAllSelected && isSelected(node.data),
    nodes.length > 0
  );

  const onAllSelected = () => {
    const items = nodes.map((node) => node.data) || [];

    if (allSelected) {
      unselectAll(items);
    } else select(items);
  };
  return (
    <Checkbox
      name="select1"
      id="header-idx"
      checked={allSelected}
      onClick={(a) => {
        onAllSelected();
      }}
    />
  );
};

const CheckboxRenderer: React.FC<any> = (props) => {
  const { isSelected, selectSingle: selectOne } =
    useSelection<IOlympicDataWithId>();
  return (
    <Checkbox
      name="select"
      id={props.data.id}
      checked={isSelected(props.data)}
      onClick={() => selectOne(props.data)}
    />
  );
};

const SelectionPreview: React.FC = () => {
  const { getSelected, unselectAll } = useSelection<IOlympicDataWithId>();
  return (
    <div>
      Selected: {getSelected().length} |{' '}
      <Button onClick={() => unselectAll()}>Unselect all</Button>
    </div>
  );
};

const GridExample: React.FC = () => {
  const grid = useRef<AgGridReact<IOlympicDataWithId>>(null);

  const [columnDefs] = useState<ColDef[]>([
    {
      cellRenderer: CheckboxRenderer,
      headerComponent: AllCheckbox,
      sortable: false,
    },
    { field: 'athlete', filter: 'agTextColumnFilter' },
    { field: 'country', filter: 'agTextColumnFilter' },
    { field: 'sport', filter: 'agTextColumnFilter' },
    { field: 'gold', aggFunc: 'sum', filter: 'agNumberColumnFilter' },
    { field: 'silver', aggFunc: 'sum', filter: 'agNumberColumnFilter' },
    { field: 'bronze', aggFunc: 'sum', filter: 'agNumberColumnFilter' },
  ]);

  const getServerSideDatasource: (server: any) => IServerSideDatasource = (
    server: any
  ) => {
    return {
      getRows: (params) => {
        console.log('[Datasource] - rows requested by grid: ', params.request);
        const response = server.getData(params.request);
        setTimeout(() => {
          if (response.success) {
            params.success({
              rowData: response.rows,
              rowCount: response.lastRow,
            });
          } else {
            params.fail();
          }
        }, 200);
      },
    };
  };

  const onGridReady = useCallback((params: GridReadyEvent) => {
    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
      .then((resp) => resp.json())
      .then((data: IOlympicDataWithId[]) => {
        data.forEach(function (item: any, index: number) {
          item.id = index;
        });
        const fakeServer = FakeServer(data);
        const datasource = getServerSideDatasource(fakeServer);
        params.api!.setGridOption('serverSideDatasource', datasource);
      });
  }, []);

  const defaultColDef: ColDef = {
    flex: 1,
  };

  const rowSelection = useMemo<
    RowSelectionOptions | 'single' | 'multiple'
  >(() => {
    return {
      mode: 'multiRow',
      checkboxes: false,
      headerCheckbox: false,
      enableClickSelection: false,
    };
  }, []);

  return (
    <SelectionProvider getId={(item: IOlympicDataWithId) => item.id + ''}>
      <SelectionPreview />
      <div style={{ width: '100%', height: '90vh' }}>
        <AgGridReact
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          rowModelType={'serverSide'}
          rowSelection={rowSelection}
          paginationPageSize={20}
          pagination
          onPaginationChanged={(e) => e.api.refreshHeader()}
          ref={grid}
        />
      </div>
    </SelectionProvider>
  );
};

export default GridExample;
