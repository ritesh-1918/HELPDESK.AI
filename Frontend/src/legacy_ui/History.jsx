import { useEffect, useState } from 'react';
import { Table, Card, Button, Tag, Space, Input } from 'antd';
import { DeleteOutlined, SearchOutlined } from '@ant-design/icons';

function History() {
  const [tickets, setTickets] = useState([]);
  const [searchText, setSearchText] = useState('');

  // Load tickets from localStorage
  useEffect(() => {
    const storedTickets = JSON.parse(localStorage.getItem('tickets')) || [];

    setTickets(storedTickets);
  }, []);

  // Clear all tickets
  const clearAllTickets = () => {
    localStorage.removeItem('tickets');
    setTickets([]);
  };

  // Priority badge colors
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Low':
        return 'green';
      case 'Medium':
        return 'orange';
      case 'High':
        return 'red';
      case 'Critical':
        return 'red';
      default:
        return 'default';
    }
  };

  // Status badge colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved':
      case 'Auto-Resolved':
        return 'success';
      case 'Open':
        return 'processing';
      default:
        return 'default';
    }
  };

  // Table columns configuration
  const columns = [
    {
      title: 'Ticket ID',
      dataIndex: 'Ticket_ID',
      key: 'Ticket_ID',
      fixed: 'left',
      width: 150,
      render: (text) => <span className='font-mono font-semibold'>{text}</span>,
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value, record) =>
        record.Ticket_ID.toLowerCase().includes(value.toLowerCase()) ||
        record.Category.toLowerCase().includes(value.toLowerCase()) ||
        (record.Summary || '').toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Category',
      dataIndex: 'Category',
      key: 'Category',
      width: 150,
      filters: [...new Set(tickets.map((t) => t.Category))].map((cat) => ({
        text: cat,
        value: cat,
      })),
      onFilter: (value, record) => record.Category === value,
      render: (text) => <Tag color='blue'>{text}</Tag>,
    },
    {
      title: 'Sub-Category',
      dataIndex: 'Sub_Category',
      key: 'Sub_Category',
      width: 150,
      render: (text) =>
        text && text !== 'N/A' ? (
          <Tag color='cyan'>{text}</Tag>
        ) : (
          <span className='text-gray-400'>-</span>
        ),
    },
    {
      title: 'Priority',
      dataIndex: 'Priority',
      key: 'Priority',
      width: 120,
      filters: [
        { text: 'Low', value: 'Low' },
        { text: 'Medium', value: 'Medium' },
        { text: 'High', value: 'High' },
        { text: 'Critical', value: 'Critical' },
      ],
      onFilter: (value, record) => record.Priority === value,
      sorter: (a, b) => {
        const priorityOrder = { Low: 1, Medium: 2, High: 3, Critical: 4 };
        return priorityOrder[a.Priority] - priorityOrder[b.Priority];
      },
      render: (text) => (
        <Tag color={getPriorityColor(text)} className='font-medium'>
          {text}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'Resolution_Status',
      key: 'Resolution_Status',
      width: 140,
      filters: [
        { text: 'Open', value: 'Open' },
        { text: 'Resolved', value: 'Resolved' },
        { text: 'Auto-Resolved', value: 'Auto-Resolved' },
      ],
      onFilter: (value, record) => record.Resolution_Status === value,
      render: (text) => <Tag color={getStatusColor(text)}>{text}</Tag>,
    },
    {
      title: 'Assigned Team',
      dataIndex: 'Assigned_Team',
      key: 'Assigned_Team',
      width: 150,
      filters: [...new Set(tickets.map((t) => t.Assigned_Team).filter(Boolean))].map((team) => ({
        text: team,
        value: team,
      })),
      onFilter: (value, record) => record.Assigned_Team === value,
      render: (text) => text || <span className='text-gray-400'>-</span>,
    },
    {
      title: 'Channel',
      dataIndex: 'Channel',
      key: 'Channel',
      width: 120,
    },
    {
      title: 'Routing Confidence',
      dataIndex: 'Routing_Confidence',
      key: 'Routing_Confidence',
      width: 160,
      sorter: (a, b) => (a.Routing_Confidence || 0) - (b.Routing_Confidence || 0),
      render: (value) => {
        if (!value) return <span className='text-gray-400'>-</span>;
        const percentage = Math.round(value * 100);
        const color = percentage > 80 ? 'green' : percentage > 50 ? 'orange' : 'red';
        return <Tag color={color}>{percentage}%</Tag>;
      },
    },
    {
      title: 'Timestamp',
      dataIndex: 'Timestamp',
      key: 'Timestamp',
      width: 180,
      sorter: (a, b) => new Date(a.Timestamp || 0) - new Date(b.Timestamp || 0),
      defaultSortOrder: 'descend',
      render: (text) => {
        if (!text) return <span className='text-gray-400'>-</span>;
        return new Date(text).toLocaleString();
      },
    },
  ];

  return (
    <div className='p-4 md:p-8'>
      <Card
        title={
          <div className='flex justify-between items-center'>
            <h2 className='text-2xl font-bold m-0'>Ticket History</h2>
            <Space>
              <Input
                placeholder='Search tickets...'
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 250 }}
                allowClear
              />
              {tickets.length > 0 && (
                <Button danger icon={<DeleteOutlined />} onClick={clearAllTickets}>
                  Clear All
                </Button>
              )}
            </Space>
          </div>
        }
        bordered={false}
      >
        <Table
          columns={columns}
          dataSource={tickets}
          rowKey='Ticket_ID'
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} tickets`,
          }}
          scroll={{ x: 1400 }}
          locale={{
            emptyText: 'No tickets submitted yet. Submit your first ticket to see it here.',
          }}
        />
      </Card>
    </div>
  );
}

export default History;
