import { useLocation, useNavigate } from "react-router-dom";
import { Card, Badge, Collapse, Timeline, Alert, Divider, Tag, Progress } from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  WarningOutlined,
  PictureOutlined
} from "@ant-design/icons";

const { Panel } = Collapse;

function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state;

  if (!data) {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="text-center" style={{ maxWidth: 400 }}>
          <h2 className="text-xl font-bold mb-4">No Ticket Data Found</h2>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </Card>
      </div>
    );
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
      case "Critical":
        return "red";
      case "Medium":
        return "orange";
      case "Low":
        return "green";
      default:
        return "default";
    }
  };

  // Parse solution_steps if it's a string
  const solutionSteps = Array.isArray(data.solution_steps)
    ? data.solution_steps
    : typeof data.solution_steps === "string"
      ? data.solution_steps.split("\n").filter((s) => s.trim())
      : [data.solution_steps || "Consult internal knowledge base for specific troubleshooting steps."];

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header Card */}
        <Card>
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Ticket Analysis Result
              </h2>
              <p className="text-gray-500">
                Ticket ID: <span className="font-mono font-semibold">{data.ticket_id || "N/A"}</span>
              </p>
            </div>

            {/* Auto-Resolve Badge */}
            {data.auto_resolve !== undefined && (
              <Badge
                count={
                  data.auto_resolve ? (
                    <Tag icon={<ThunderboltOutlined />} color="success">
                      Auto-Resolved
                    </Tag>
                  ) : (
                    <Tag icon={<TeamOutlined />} color="processing">
                      Human Required
                    </Tag>
                  )
                }
              />
            )}
          </div>
        </Card>

        {/* Auto-Resolve Alert */}
        {data.auto_resolve === false && (
          <Alert
            message="Human Intervention Required"
            description="This ticket requires manual review by a support team member. The AI has identified complexity that needs human expertise."
            type="warning"
            icon={<WarningOutlined />}
            showIcon
          />
        )}

        {data.auto_resolve === true && (
          <Alert
            message="Ticket Auto-Resolved"
            description="The AI has automatically resolved this ticket based on known solutions. The user has been notified with step-by-step instructions."
            type="success"
            icon={<CheckCircleOutlined />}
            showIcon
          />
        )}

        {/* Classification Card */}
        <Card title="Classification & Routing" bordered={false}>
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <span className="font-semibold min-w-[140px]">Category:</span>
              <Tag color="blue" className="text-sm">
                {data.category}
              </Tag>
              {data.subcategory && (
                <Tag color="cyan" className="text-sm">
                  {data.subcategory}
                </Tag>
              )}
            </div>

            <div className="flex items-center gap-4">
              <span className="font-semibold min-w-[140px]">Priority:</span>
              <Tag color={getPriorityColor(data.priority)} className="text-sm">
                {data.priority}
              </Tag>
            </div>

            <div className="flex items-center gap-4">
              <span className="font-semibold min-w-[140px]">Assigned Team:</span>
              <Tag icon={<TeamOutlined />} color="purple" className="text-sm">
                {data.assigned_team}
              </Tag>
            </div>

            {/* Routing Confidence */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">Routing Confidence:</span>
                <span className="text-gray-600 font-bold">{Math.round((data.routing_confidence || data.confidence || 0) * 100)}%</span>
              </div>
              <Progress
                percent={Math.round((data.routing_confidence || data.confidence || 0) * 100)}
                status={(data.routing_confidence || data.confidence || 0) > 0.8 ? "success" : "normal"}
                strokeColor={{
                  "0%": "#108ee9",
                  "100%": "#87d068",
                }}
              />
            </div>

            {/* Summary & Reasoning */}
            {(data.summary || data.reasoning) && (
              <div className="space-y-4 pt-4 border-t border-gray-100">
                {data.summary && (
                  <div>
                    <span className="font-semibold text-gray-400 text-xs uppercase tracking-widest block mb-2">AI Summary:</span>
                    <p className="bg-gray-50 p-4 rounded-lg text-gray-700 border-l-4 border-blue-500 shadow-sm">
                      {data.summary}
                    </p>
                  </div>
                )}
                {data.reasoning && (
                  <div>
                    <span className="font-semibold text-gray-400 text-xs uppercase tracking-widest block mb-2">AI Reasoning:</span>
                    <p className="bg-emerald-50 p-4 rounded-lg text-emerald-800 border-l-4 border-emerald-500 italic shadow-sm">
                      {data.reasoning}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Visual Analysis Card (Gemini) */}
        {(data.image_description || data.ocr_text) && (
          <Card title={<span><PictureOutlined className="mr-2" />Visual Analysis</span>} bordered={false}>
            <div className="space-y-4">
              {data.image_description && (
                <div>
                  <span className="font-semibold text-gray-400 text-xs uppercase tracking-widest block mb-1">Image Description:</span>
                  <p className="bg-blue-50 p-4 rounded-lg text-blue-900 border-l-4 border-blue-500 italic shadow-sm">
                    "{data.image_description}"
                  </p>
                </div>
              )}
              {data.ocr_text && (
                <div>
                  <span className="font-semibold text-gray-400 text-xs uppercase tracking-widest block mb-1">Detected Text (OCR):</span>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 font-mono text-xs text-gray-700 whitespace-pre-wrap">
                    {data.ocr_text}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )
        }

        {/* Suggested Solution Card */}
        <Card title="Suggested Solution" bordered={false}>
          <Timeline
            items={solutionSteps.map((step, index) => ({
              color: index === 0 ? "green" : "blue",
              children: (
                <div>
                  <p className="font-medium">Step {index + 1}</p>
                  <p className="text-gray-600">{step}</p>
                </div>
              ),
            }))}
          />
        </Card>

        {/* Explainable AI Section */}
        {
          ((data.decision_factors && data.decision_factors.length > 0) || data.duplicate_probability !== undefined) && (
            <Card title="Explainable AI - Decision Reasoning" bordered={false}>
              <Collapse
                defaultActiveKey={["1"]}
                expandIconPosition="end"
                items={[
                  {
                    key: "1",
                    label: (
                      <span className="font-semibold">
                        <InfoCircleOutlined className="mr-2" />
                        Why did the AI make these decisions?
                      </span>
                    ),
                    children: (
                      <div className="space-y-4">
                        {/* Decision Factors */}
                        {data.decision_factors && data.decision_factors.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2">Key Decision Factors:</h4>
                            <ul className="list-disc list-inside space-y-1">
                              {data.decision_factors.map((factor, idx) => (
                                <li key={idx} className="text-gray-700">
                                  {factor}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Duplicate Detection */}
                        {data.duplicate_probability !== undefined && (
                          <div className="pt-4 border-t border-gray-100 mt-4">
                            <h4 className="font-semibold mb-3">Duplicate Detection:</h4>
                            <div className="flex items-center gap-6">
                              <Progress
                                type="circle"
                                percent={Math.round(data.duplicate_probability * 100)}
                                width={70}
                                status={data.duplicate_probability > 0.7 ? "exception" : "normal"}
                              />
                              <div>
                                <p className="text-gray-700 font-medium">
                                  {data.duplicate_probability > 0.7
                                    ? "High likelihood this is a duplicate ticket"
                                    : data.duplicate_probability > 0.4
                                      ? "Moderate similarity to existing tickets"
                                      : "Appears to be a unique issue"}
                                </p>
                                {data.duplicate_probability > 0.7 && (
                                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                    <ClockCircleOutlined /> Consider checking ticket history before proceeding
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ),
                  },
                ]}
              />
            </Card>
          )
        }

        {/* Action Buttons */}
        <div className="flex justify-between items-center py-4">
          <button
            onClick={() => navigate("/")}
            className="bg-gray-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-600 transition-all shadow-md active:scale-95"
          >
            Submit Another
          </button>

          <button
            onClick={() => {
              const currentUser = JSON.parse(sessionStorage.getItem("currentUser") || "{}");
              if (currentUser.role === "admin") {
                navigate("/history");
              } else {
                navigate("/my-tickets");
              }
            }}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95"
          >
            View History
          </button>
        </div>
      </div >
    </div >
  );
}

export default Result;
