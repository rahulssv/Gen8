
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QueryResult, StatisticalData } from '@/api/types';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend
} from 'recharts';

interface VisualizationCardProps {
  result: QueryResult;
}

const VisualizationCard = ({ result }: VisualizationCardProps) => {
  // Format data for the pie chart (entity distribution)
  const entityData = result.entities.map(entity => ({
    name: entity.name,
    value: entity.mentions,
    type: entity.type
  }));

  // Format data for the bar chart (statistical data)
  const statData = result.statistics
    .filter(stat => stat.type === 'survival rate' || stat.type === 'efficacy')
    .map(stat => ({
      name: stat.context.split(' ').slice(0, 3).join(' ') + '...',
      value: typeof stat.value === 'number' ? stat.value : parseFloat(stat.value),
      unit: stat.unit || '',
      fullName: stat.context
    }));

  const COLORS = ['#3B82F6', '#10B981', '#FBBF24', '#F87171', '#8B5CF6', '#EC4899'];

  return (
    <Card className="shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-900/50 border-b border-gray-100 dark:border-gray-800 pb-3">
        <Badge variant="outline" className="mb-2 bg-insight-50 text-insight-700 border-insight-200">
          Visual Analysis
        </Badge>
        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
          Data Visualization
        </CardTitle>
      </CardHeader>
      <CardContent className="py-5">
        <div className="space-y-8">
          {/* Entity Distribution Chart */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 px-3">
              Entity Mentions Distribution
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={entityData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {entityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name, props) => [
                      `${value} mentions`,
                      `${props.payload.type}`
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Statistical Comparison Chart */}
          {statData.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 px-3">
                Statistical Comparison
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={statData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${value}${statData[0].unit || ''}`]}
                      labelFormatter={(label, payload) => {
                        return payload[0]?.payload.fullName || label;
                      }}
                    />
                    <Legend />
                    <Bar dataKey="value" fill="#3B82F6" barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VisualizationCard;
