using System.Collections.Generic;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TheUnbaisedReport.Model;
using TheUnbaisedReport.Service;

namespace TheUnbaisedReport.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
        public class ReportController : ControllerBase
        {
            private readonly ReportService _reportService;

            public ReportController(ReportService reportService)
            {
                _reportService = reportService;
            }

            [HttpGet("all")]
            public async Task<ActionResult<IEnumerable<Report>>> GetAll()
            {
                var reports = await _reportService.GetAllAsync();
            Console.WriteLine("MongoDB returned count: " + reports.Count);

            return Ok(reports.Select(r => new {
                r.Id,
                r.Label,
                r.Heading,
                r.Summary,
                r.Date,
                r.Time,
                r.Place,
                r.Context
            }));

        }

        [HttpGet("technology")]
            public async Task<ActionResult<IEnumerable<Report>>> GetTechnology() =>
                Ok(await _reportService.GetByLabelAsync("technology"));

            [HttpGet("politics")]
            public async Task<ActionResult<IEnumerable<Report>>> GetPolitics() =>
                Ok(await _reportService.GetByLabelAsync("politics"));

            [HttpGet("sports")]
            public async Task<ActionResult<IEnumerable<Report>>> GetSports() =>
                Ok(await _reportService.GetByLabelAsync("sports"));

            [HttpGet("entertainment")]
            public async Task<ActionResult<IEnumerable<Report>>> GetEntertainment() =>
                Ok(await _reportService.GetByLabelAsync("entertainment"));

            [HttpGet("business")]
            public async Task<ActionResult<IEnumerable<Report>>> GetBusiness() =>
                Ok(await _reportService.GetByLabelAsync("business"));
            [HttpGet("{id}")]
            public async Task<ActionResult<Report>> GetById(string id)
            {
                var report = await _reportService.GetByIdAsync(id);
                if (report == null)
                {
                    return NotFound();
                }

                return Ok(new
                {
                    report.Id,
                    report.Label,
                    report.Heading,
                    report.Summary,
                    report.Date,
                    report.Time,
                    report.Place,
                    report.Context
                });
            }
    }

    
}
