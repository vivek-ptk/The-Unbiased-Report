using Microsoft.Extensions.Options;
using MongoDB.Driver;
using TheUnbaisedReport.Data;
using TheUnbaisedReport.Model;

namespace TheUnbaisedReport.Service
{
    public class ReportService
    {

            private readonly IMongoCollection<Report> _reports;

            public ReportService(IOptions<MongoDBSettings> settings)
            {
                var client = new MongoClient(settings.Value.ConnectionString);
                var database = client.GetDatabase(settings.Value.DatabaseName);
                _reports = database.GetCollection<Report>(settings.Value.CollectionName);
            }

            public async Task<List<Report>> GetAllAsync() =>
                await _reports.Find(_ => true).ToListAsync();

            public async Task<List<Report>> GetByLabelAsync(string label) =>
                await _reports.Find(r => r.Label.ToLower() == label.ToLower()).ToListAsync();
        }

    
}
