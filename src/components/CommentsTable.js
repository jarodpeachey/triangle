/* eslint-disable react/prop-types */
/* eslint-disable no-shadow */
/* eslint-disable react/display-name */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/button-has-type */
/* eslint-disable no-nested-ternary */
/* eslint-disable react/jsx-key */
/* eslint-disable react/jsx-fragments */
import React, { useState } from 'react';
import styled, { css, ThemeContext, keyframes } from 'styled-components';
import {
  useTable,
  usePagination,
  useSortBy,
  useFilters,
  useGroupBy,
  useExpanded,
  useRowSelect,
} from 'react-table';
import matchSorter from 'match-sorter';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Card from './Card';
import { useContext } from 'react';
import Loader from './Loader';

// Create an editable cell renderer
const DefaultCell = ({
  value: initialValue,
  row: { index },
  column: { id },
}) => {
  // We need to keep and update the state of the cell normally
  const [value, setValue] = React.useState(initialValue);

  // If the initialValue is changed externall, sync it up with our state
  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // if (!editable) {
  return `${initialValue}`;
  // }

  // return <input value={value} onChange={onChange} onBlur={onBlur} />;
};

// Create an editable cell renderer
const EditableCell = ({
  value: initialValue,
  row: { index },
  column: { id },
  updateMyData, // This is a custom function that we supplied to our table instance
  editable,
}) => {
  // We need to keep and update the state of the cell normally
  const [value, setValue] = React.useState(initialValue);

  const onChange = (e) => {
    setValue(e.target.value);
  };

  // We'll only update the external data when the input is blurred
  const onBlur = () => {
    updateMyData(index, id, value);
  };

  // If the initialValue is changed externall, sync it up with our state
  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  if (!editable) {
    return `${initialValue}`;
  }

  return <input value={value} onChange={onChange} onBlur={onBlur} />;
};

// This is a custom filter UI for selecting
// a unique option from a list
export function SelectColumnFilter({
  column: { filterValue, setFilter, preFilteredRows, id },
}) {
  // Calculate the options for filtering
  // using the preFilteredRows
  const options = React.useMemo(() => {
    const options = new Set();
    preFilteredRows.forEach((row) => {
      options.add(row.values[id]);
    });
    return [...options.values()];
  }, [id, preFilteredRows]);

  // Render a multi-select box
  return (
    <SelectWrapper>
      <Select
        value={filterValue}
        onChange={(e) => {
          setFilter(e.target.value || undefined);
        }}
      >
        <option value=''>All</option>
        {options.map((option, i) => (
          <option key={i} value={option}>
            {option}
          </option>
        ))}
      </Select>
    </SelectWrapper>
  );
}

// This is a custom filter UI that uses a
// slider to set the filter value between a column's
// min and max values
function SliderColumnFilter({
  column: { filterValue, setFilter, preFilteredRows, id },
}) {
  // Calculate the min and max
  // using the preFilteredRows

  const [min, max] = React.useMemo(() => {
    let min = preFilteredRows.length ? preFilteredRows[0].values[id] : 0;
    let max = preFilteredRows.length ? preFilteredRows[0].values[id] : 0;
    preFilteredRows.forEach((row) => {
      min = Math.min(row.values[id], min);
      max = Math.max(row.values[id], max);
    });
    return [min, max];
  }, [id, preFilteredRows]);

  return (
    <>
      <input
        type='range'
        min={min}
        max={max}
        value={filterValue || min}
        onChange={(e) => {
          setFilter(parseInt(e.target.value, 10));
        }}
      />
      <button onClick={() => setFilter(undefined)}>Off</button>
    </>
  );
}

// This is a custom UI for our 'between' or number range
// filter. It uses two number boxes and filters rows to
// ones that have values between the two
function NumberRangeColumnFilter({
  column: { filterValue = [], preFilteredRows, setFilter, id },
}) {
  const [min, max] = React.useMemo(() => {
    let min = preFilteredRows.length ? preFilteredRows[0].values[id] : 0;
    let max = preFilteredRows.length ? preFilteredRows[0].values[id] : 0;
    preFilteredRows.forEach((row) => {
      min = Math.min(row.values[id], min);
      max = Math.max(row.values[id], max);
    });
    return [min, max];
  }, [id, preFilteredRows]);

  return (
    <span
      style={{
        display: 'flex',
      }}
    >
      <input
        value={filterValue[0] || ''}
        type='number'
        onChange={(e) => {
          const val = e.target.value;
          setFilter((old = []) => [
            val ? parseInt(val, 10) : undefined,
            old[1],
          ]);
        }}
        placeholder={`Min (${min})`}
        style={{
          width: '70px',
          marginRight: '0.5rem',
        }}
      />
      to
      <input
        value={filterValue[1] || ''}
        type='number'
        onChange={(e) => {
          const val = e.target.value;
          setFilter((old = []) => [
            old[0],
            val ? parseInt(val, 10) : undefined,
          ]);
        }}
        placeholder={`Max (${max})`}
        style={{
          width: '70px',
          marginLeft: '0.5rem',
        }}
      />
    </span>
  );
}

function fuzzyTextFilterFn(rows, id, filterValue) {
  return matchSorter(rows, filterValue, { keys: [(row) => row.values[id]] });
}

// Let the table remove the filter if the string is empty
fuzzyTextFilterFn.autoRemove = (val) => !val;

// Be sure to pass our updateMyData and the skipReset option
function CommentsTable({
  columns,
  data,
  updateMyData,
  skipReset,
  deleteComments,
  approveComments,
  unapproveComments,
  mode,
  loading,
}) {
  const filterTypes = React.useMemo(
    () => ({
      // Add a new fuzzyTextFilterFn filter type.
      fuzzyText: fuzzyTextFilterFn,
      // Or, override the default text filter to use
      // "startWith"
      text: (rows, id, filterValue) => {
        return rows.filter((row) => {
          const rowValue = row.values[id];
          return rowValue !== undefined
            ? String(rowValue)
                .toLowerCase()
                .startsWith(String(filterValue).toLowerCase())
            : true;
        });
      },
    }),
    []
  );
  const theme = useContext(ThemeContext);

  // Define a default UI for filtering
  function DefaultColumnFilter({
    column: { filterValue, preFilteredRows, setFilter },
  }) {
    const count = preFilteredRows.length;
    const [showFilter, setShowFilter] = useState(true);

    if (showFilter) {
      return (
        <>
          <Input
            style={{
              width: 70,
            }}
            value={filterValue || ''}
            onChange={(e) => {
              setFilter(e.target.value || undefined); // Set undefined to remove the filter entirely
            }}
            placeholder={`Filter ${count} results...`}
          />
          {/* <FontAwesomeIcon onClick={() => setShowFilter(false)} icon='cog' /> */}
        </>
      );
    }

    // return <FontAwesomeIcon onClick={() => setShowFilter(true)} icon='search' />;
  }

  const actionsMenuComponent = (selectedFlatRows) => {
    const [open, setOpen] = useState(false);

    return (
      <div
        style={{
          position: 'relative',
          width: 'fit-content',
          margin: '0 0 12px 0',
        }}
      >
        <ActionsWrapper
          disabled={selectedFlatRows.length === 0}
          open={open}
          onClick={() => setOpen(!open)}
        >
          Actions
          <FontAwesomeIcon icon='chevron-down' />
        </ActionsWrapper>
        <Card
          customStyles={`
        padding: 4px 0;
        display: ${open ? 'block' : 'block'};
        visibility: ${open ? 'visible' : 'hidden'};
        position: absolute;
        bottom: 0;
        z-index: 99999;
        width: 140%;
        box-shadow: 2px 2px 15px -5px #e8e8e8;
        box-shadow: 0 6px 12px rgba(0,0,0,.08);
        left: 0;
        border-radius: 5px;
        transform: scale(${open ? 1 : 0.6});
        transition: transform 0.05s ease-out !important;
        top: 110%;
        height: fit-content;
        white-space: no-wrap;
      `}
        >
          {mode === 'approved' ? (
            <>
              <Action
                onClick={() => {
                  setOpen(false);
                  deleteComments(selectedFlatRows);
                }}
              >
                Delete
              </Action>
              <Action
                onClick={() => {
                  setOpen(false);
                  unapproveComments(selectedFlatRows);
                }}
              >
                Move to Held For Review
              </Action>
            </>
          ) : (
            <>
              <Action
                onClick={() => {
                  setOpen(false);
                  deleteComments(selectedFlatRows);
                }}
              >
                Delete
              </Action>
              <Action
                onClick={() => {
                  setOpen(false);
                  approveComments(selectedFlatRows);
                }}
              >
                Approve
              </Action>
            </>
          )}
        </Card>
      </div>
    );
  };

  const defaultColumn = React.useMemo(
    () => ({
      // Let's set up our default Filter UI
      Filter: DefaultColumnFilter,
      // And also our default editable cell
      Cell: DefaultCell,
    }),
    []
  );

  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page, // Instead of using 'rows', we'll use page,
    // which has only the rows for the active page

    // The rest of these things are super handy, too ;)
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    selectedFlatRows,
    state: {
      pageIndex,
      pageSize,
      sortBy,
      groupBy,
      expanded,
      filters,
      selectedRowIds,
      selectedComments,
    },
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
      filterTypes,
      // updateMyData isn't part of the API, but
      // anything we put into these options will
      // automatically be available on the instance.
      // That way we can call this function from our
      // cell renderer!
      updateMyData,
      // We also need to pass this so the page doesn't change
      // when we edit the data.
      autoResetPage: !skipReset,
      autoResetSelectedRows: !skipReset,
      disableMultiSort: true,
    },
    useFilters,
    useGroupBy,
    useSortBy,
    useExpanded,
    usePagination,
    useRowSelect,
    // Here we will use a plugin to add our selection column
    (hooks) => {
      hooks.visibleColumns.push((columns) => {
        return [
          {
            id: 'selection',
            // Make this column a groupByBoundary. This ensures that groupBy columns
            // are placed after it
            groupByBoundary: true,
            // The header can use the table's getToggleAllRowsSelectedProps method
            // to render a checkbox
            Header: ({ getToggleAllRowsSelectedProps }) => (
              <span>
                <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
              </span>
            ),
            // The cell can use the inspanidual row's getToggleRowSelectedProps method
            // to the render a checkbox
            Cell: ({ row }) => (
              <span>
                <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
              </span>
            ),
          },
          ...columns,
        ];
      });
    }
  );

  const getPagesMapped = () => {
    const pagesMapped = [];
    for (let i = 0; i < pageCount; i++) {
      pagesMapped.push(i);
    }

    return pagesMapped;
  };

  console.log(getPagesMapped);

  // Render the UI for your table
  return (
    <div>
      {actionsMenuComponent(selectedFlatRows)}
      <Table
        style={{ position: 'relative' }}
        skelton={loading}
        {...getTableProps()}
      >
        <THead>
          {headerGroups.map((headerGroup) => (
            <TR {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <TH skeleton={loading} {...column.getHeaderProps()}>
                  <span>
                    {column.canGroupBy ? (
                      // If the column can be grouped, let's add a toggle
                      <span {...column.getGroupByToggleProps()}>
                        {/* {column.isGrouped ? '🛑 ' : '👊 '} */}
                      </span>
                    ) : null}
                    <span {...column.getSortByToggleProps()}>
                      {column.render('Header')}
                      {/* Add a sort direction indicator */}
                      {column.isSorted
                        ? column.isSortedDesc
                          ? ' 🔽'
                          : ' 🔼'
                        : ''}
                    </span>
                  </span>
                  {/* Render the columns filter UI */}
                  <span>
                    {column.canFilter ? column.render('Filter') : null}
                  </span>
                </TH>
              ))}
            </TR>
          ))}
        </THead>
        <TBody skeleton={loading} {...getTableBodyProps()}>
          {loading && (
            <LoadingWrapper style={{ background: 'transparent' }}>
              <Loader height={50} color={theme.color.primary.main} />
            </LoadingWrapper>
          )}
          {page.map((row) => {
            prepareRow(row);

            return (
              <TR dataRef={row.original.ref} {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  return (
                    <TD skeleton={loading} {...cell.getCellProps()}>
                      <span>
                        {cell.isGrouped ? (
                          // If it's a grouped cell, add an expander and row count
                          <>
                            <span {...row.getToggleRowExpandedProps()}>
                              {row.isExpanded ? '👇' : '👉'}
                            </span>{' '}
                            {cell.render('Cell', { editable: false })} (
                            {row.subRows.length})
                          </>
                        ) : cell.isAggregated ? (
                          // If the cell is aggregated, use the Aggregated
                          // renderer for cell
                          cell.render('Aggregated')
                        ) : cell.isPlaceholder ? null : ( // For cells with repeated values, render null
                          // Otherwise, just render the regular cell
                          cell.render('Cell', { editable: true })
                        )}
                      </span>
                    </TD>
                  );
                })}
              </TR>
            );
          })}
        </TBody>
      </Table>
      {/*
        Pagination can be built however you'd like.
        This is just a very basic UI implementation:
      */}
      <TableNav>
        <span>
          Page{' '}
          <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>
        </span>
        <span>
          Go to page:
          <select
            defaultValue={pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              gotoPage(page);
            }}
            style={{ width: '100px' }}
          >
            {getPagesMapped() &&
              getPagesMapped().length > 0 &&
              getPagesMapped().map((newPage) => {
                return <option value={newPage + 1}>{newPage + 1}</option>;
              })}
          </select>
          <input type='number' />
        </span>
        Rows per page:
        <RowsPerPage
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
          }}
        >
          {[10, 20, 30, 40, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              {pageSize}
            </option>
          ))}
        </RowsPerPage>
        <NavButton onClick={() => previousPage()} disabled={!canPreviousPage}>
          {'<'}
        </NavButton>
        <NavButton onClick={() => nextPage()} disabled={!canNextPage}>
          {'>'}
        </NavButton>
      </TableNav>
      {/* <pre>
        <code>
          {JSON.stringify(
            {
              pageIndex,
              pageSize,
              pageCount,
              canNextPage,
              canPreviousPage,
              sortBy,
              groupBy,
              expanded,
              filters,
              selectedRowIds,
            },
            null,
            2
          )}
        </code>
      </pre> */}
    </div>
  );
}

// Define a custom filter filter function!
function filterGreaterThan(rows, id, filterValue) {
  return rows.filter((row) => {
    const rowValue = row.values[id];
    return rowValue >= filterValue;
  });
}

// This is an autoRemove method on the filter function that
// when given the new filter value and returns true, the filter
// will be automatically removed. Normally this is just an undefined
// check, but here, we want to remove the filter if it's not a number
filterGreaterThan.autoRemove = (val) => typeof val !== 'number';

// This is a custom aggregator that
// takes in an array of leaf values and
// returns the rounded median
function roundedMedian(leafValues) {
  let min = leafValues[0] || 0;
  let max = leafValues[0] || 0;

  leafValues.forEach((value) => {
    min = Math.min(min, value);
    max = Math.max(max, value);
  });

  return Math.round((min + max) / 2);
}

const IndeterminateCheckbox = React.forwardRef(
  ({ indeterminate, ...rest }, ref) => {
    const defaultRef = React.useRef();
    const resolvedRef = ref || defaultRef;

    React.useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate;
    }, [resolvedRef, indeterminate]);

    return (
      <>
        <Checkbox>
          <input
            ref={resolvedRef}
            {...rest}
            className='checkbox'
            type='checkbox'
          />
          <span className='checkmark'>
            <div className='icon'>
              <FontAwesomeIcon icon='check' />
            </div>
          </span>
        </Checkbox>
      </>
    );
  }
);

const TableNav = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

const RowsPerPage = styled.select`
  border: none;
  background: #f7f7f7;
  border-radius: 5px;
`;

const NavButton = styled.button`
  border: none;
  background: white;
  border-radius: 100px;
  border: 1px solid ${(props) => props.theme.color.gray.three};
  color: black;
  padding: 8px;
`;

const shimmer = keyframes`
  100% {
    transform: translateX(120%);
  }
`;

const LoadingWrapper = styled.div`
  position: absolute;
  overflow: hidden;
  height: calc(100% - 66px);
  z-index: 999999;
  top: 66px;
  width: 100%;
  background: ${(props) => props.theme.color.gray.two}ee;
  display: flex;
  align-items: center;
  justify-content: center;
  &::after {
    content: '' !important;
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    width: 100%;
    height: 100% !important;
    bottom: 0 !important;
    transform: translateX(-100%) !important;
    background-image: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0,
      rgba(255, 255, 255, 0.5) 30%,
      rgba(255, 255, 255, 0) 50%,
      rgba(255, 255, 255, 0.5) 70%,
      rgba(255, 255, 255, 0) 100%
    ) !important;
    animation: ${shimmer} 3s infinite !important;
  }
`;

const ActionsWrapper = styled.button`
  border: none;
  outline: none;
  font-weight: normal !important;
  cursor: pointer;
  border-radius: 50px;
  position: relative;
  padding: 4px 12px 4px 12px;
  background: ${(props) => props.theme.color.primary.backgroundDark};
  // -webkit-appearance: none;
  color: ${(props) => props.theme.color.primary.backgroundDark};
  font-size: 16px;
  line-height: 1;
  border: 0;
  width: auto;
  border-radius: 5px;
  height: 32px;
  background: ${(props) => props.theme.color.gray.three};
  -webkit-appearance: none;
  background-size: 12px;
  background-position-x: 90%;
  margin-top: 4px;
  svg {
    // padding: 0px 12px;
    margin-left: 6px;
    // position: relative;
    top: 2px;
    font-size: 14px;
    transform: rotate(${(props) => (props.open ? '180deg' : '0deg')});
    transition: all 0.1s;
  }
  ${(props) =>
    props.disabled &&
    css`
      cursor: initial;
      color: ${(props) => props.theme.color.gray.five};
      background: ${(props) => props.theme.color.gray.two};
    `};
`;

const ActionsMenu = styled.div``;

const Action = styled.button`
  border: none;
  padding: 8px 12px;
  background: white;
  margin: 0;
  cursor: pointer;
  font-family: 'Open Sans';
  width: 100%;
  text-align: left;
  :hover {
    background: ${(props) => props.theme.color.gray.three};
  }
`;

const Input = styled.input`
  border: none;
  outline: none;
  display: block;
  font-weight: normal !important;
  border-radius: 50px;
  position: relative;
  padding: 2px 8px;
  background: ${(props) => props.theme.color.gray.three};
  // -webkit-appearance: none;
  color: ${(props) => props.theme.color.primary.backgroundDark} !important;
  font-size: 16px;
  line-height: 1;
  border: 0;
  width: 100% !important;
  border-radius: 5px;
  height: 26px;
  margin-left: auto;
  // background: url(http://cdn1.iconfinder.com/data/icons/cc_mono_icon_set/blacks/16x16/br_down.png)
  //   no-repeat right ${(props) => props.theme.color.gray.three};
  // -webkit-appearance: none;
  // background-size: 12px;
  // background-position-x: 90%;
  margin-top: 4px;
  margin-bottom: 6px;
`;

const Checkbox = styled.div`
  display: block;
  position: relative;
  width: 19px;
  height: 19px;
  cursor: pointer;
  input {
    position: absolute;
    opacity: 0;
    left: 0;
    cursor: pointer;
    z-index: 999;
    margin: 0;
    height: 19px;
    width: 19px;
  }
  .checkmark {
    height: 19px;
    width: 19px;
    background-color: #eee;
    display: flex;
    position: relative;
    align-items: center;
    justify-content: center;
    border-radius: 5px;
    border: 1px solid #e8e8e8;
    background: #ffffff;
    transition: .1s ease-out;
    background: transparent;
  }
  input:checked ~ .checkmark {
    background: ${(props) => props.theme.color.primary.backgroundDark};
  }
  .icon {
    display: none;
  }
  // input:checked ~ .icon {
  //   display: block;
  // }
  input:checked ~ .checkmark > .icon {
    font-size: 11px;
    color: white;
    // color: ${(props) => props.theme.color.primary.main};
    top: .07em;
    position: relative;
    display: block;
    transition: .1s ease-out;
  }
`;

const Table = styled.table`
  // width: 100%;
  // margin: 0;
  table-layout: fixed;
  // display: table;
  border-spacing: 0px;
  margin-bottom: 24px;
  // position: relative;
  ${(props) =>
    props.skeleton &&
    css`
      position: relative !important;
      display: block !important;
    `}
`;

const THead = styled.thead`
  margin: 0;
`;

const TBody = styled.tbody`
  margin: 0;
  tr {
    vertical-align: top;
  }
  position: relative;
`;

const TR = styled.tr`
  border-radius: 5px;
  // margin: 8px 0;
  width: 100%;
`;

const TH = styled.th`
  // border-top: 1px solid #e8e8e8 !important;
  border-bottom: 1px solid #e8e8e8 !important;
  span {
    font-weight: 600 !important;
  }
  padding: 4px 24px 4px 0;
  font-weight: 800 !important;
  text-align: left;
  margin: 0;
  width: fit-content;

  :first-child {
    text-align: center;
    padding: 12px;
    width: fit-content;
    position: relative;
    padding-bottom: 0;
    span:first-child {
      position: relative;
      top: 1px;
    }
  }
  :nth-child(2) {
    text-align: left;
    padding-left: 12px;
  }
  :nth-child(3) {
    min-width: 15% !important;
    width: 70% !important;
    max-width: 250px !important;
    white-space: -moz-pre-wrap !important; /* Mozilla, since 1999 */
    white-space: -pre-wrap; /* Opera 4-6 */
    white-space: -o-pre-wrap; /* Opera 7 */
    white-space: pre-wrap; /* css-3 */
    word-wrap: break-word; /* Internet Explorer 5.5+ */
    white-space: -webkit-pre-wrap; /* Newer versions of Chrome/Safari*/
    word-break: break-all;
    white-space: normal;
  }
  :nth-child(4) {
    width: 70%;
  }
  :last-child {
    text-align: right;
    // width: auto;
    // min-width: 50%;
    // width: fit-content;
    // flex: 1 1 0;
    width: 100%;
    padding-right: 0;
  }
  width: 1px;
  white-space: nowrap;
  ${(props) =>
    props.skeleton &&
    css`
    input {
      cursor: not-allowed !important;
    }
    input::placeholder {
      color: transparent !important;
    }
    position: relative !important;
    :first-child span {
      background: ${(props) => props.theme.color.gray.three} !important;
      border-radius: 5px !important;
      color: transparent !important;
    }
    // :nth-child(3) span {
    //   ::after {
    //     position: relative;
    //     top: 0;
    //     display: block;
    //     height: 100%;
    //     width: 100%:
    //     content: "";
    //     background: ${(props) => props.theme.color.gray.three};
    //   }
    // }
  `};
`;

const TD = styled.td`
  // border-top: 1px solid #e8e8e8 !important;
  border-bottom: 1px solid #e8e8e8 !important;
  font-weight: 400;
  padding: 12px 24px 12px 0;
  font-weight: 500;
  text-align: left;
  margin: 0;
  // width: 100%;
  width: fit-content;
  :first-child {
    text-align: center;
    padding: 12px;
    width: fit-content;
  }
  :nth-child(2) {
    text-align: left;
    padding-left: 12px;
  }
  :nth-child(3) {
    min-width: 15% !important;
    width: 70% !important;
    max-width: 250px !important;
    white-space: -moz-pre-wrap !important; /* Mozilla, since 1999 */
    white-space: -pre-wrap; /* Opera 4-6 */
    white-space: -o-pre-wrap; /* Opera 7 */
    white-space: pre-wrap; /* css-3 */
    word-wrap: break-word; /* Internet Explorer 5.5+ */
    white-space: -webkit-pre-wrap; /* Newer versions of Chrome/Safari*/
    word-break: break-all;
    white-space: normal;
  }
  :nth-child(4) {
    width: 70%;
  }
  :last-child {
    text-align: right;
    // width: auto;
    // min-width: 50%;
    // width: fit-content;
    // flex: 1 1 0;
    width: 100%;
    padding-right: 0;
  }
  width: 1px;
  white-space: nowrap;
  ${(props) =>
    props.skeleton &&
    css`
      :nth-child(1) span {
        background: ${(props) => props.theme.color.gray.three} !important;
        border-radius: 5px !important;
        // line-height: 8px !important;
        color: transparent !important;
      }
      :nth-child(2) span,
      :nth-child(3) span,
      :nth-child(4) span {
        background: ${(props) => props.theme.color.gray.three} !important;
        border-radius: 5px !important;
        // line-height: 8px !important;
        max-height: 21px !important;
        display: block !important;
        height: fit-content !important;
        width: fit-content;
        color: transparent !important;
      }
      :nth-child(3) span::after {
        content: '';
        position: absolute;
        left: 0;
        width: 100%;
        height: 21px;
        display: block;
        background: ${(props) => props.theme.color.gray.three};
        border-radius: 5px;
        width: 70%;
        top: 26px;
        // z-index: 9999;
      }
      :nth-child(3) span {
        position: relative;
        margin-bottom: 26px;
      }
    `};
`;

export default CommentsTable;
