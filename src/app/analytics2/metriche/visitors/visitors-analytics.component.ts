import { Subscription } from 'rxjs/Subscription';
import { Chart } from 'chart.js';
import { AnalyticsService } from 'app/services/analytics.service';
import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'appdashboard-visitors-analytics',
  templateUrl: './visitors-analytics.component.html',
  styleUrls: ['./visitors-analytics.component.scss']
})
export class VisitorsAnalyticsComponent implements OnInit {

  lang: string;
  monthNames: any;
  cellSettings: Object;
  xAxis: Object;
  yAxis: Object;
  titleSettings: Object;
  paletteSettings: Object;
  xlabel_ita = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
  xlabel_eng = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  ylabel_ita = ['01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '24:00']
  ylabel_eng = ['1am', '2am', '3am', '4am', '5am', '6am', '7am', '8am', '9am', '10am', '11am', '12am', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm', '9pm', '10pm', '11pm', '12pm']
  weekday: any;
  hour: any;

  lastdays = 7;
  selectedDaysId:number; //lastdays filter
  selectedDeptId:string;  //department filter
  lineChart: any;
  subscription: Subscription;
  initDay:string;
  endDay:string;
  selected:string;

  constructor(private translate: TranslateService,
    private analyticsService: AnalyticsService) {

    this.lang = this.translate.getBrowserLang();
    console.log('LANGUAGE ', this.lang);
    this.switchMonthName();

  }

  ngOnInit() {
    this.selected='day'
    this.selectedDeptId = '';
    this.selectedDaysId=7;

    this.initDay=moment().subtract(6, 'd').format('D/M/YYYY')
    this.endDay=moment().subtract(0, 'd').format('D/M/YYYY')
    console.log("INIT", this.initDay, "END", this.endDay);
  
    this.getVisitorsByLastNDays(this.selectedDaysId);
    //this.getVisitors();
    // this.getVisitorsByLast7Days();
    // this.getVisitorsWeek();
    // this.getVisitorsMonth();
  }

  daysSelect(value, event) {
    console.log("EVENT: ", event)
    this.selectedDaysId = value;

    if (value <= 30) {
      this.lastdays = value;
    } else if ((value == 90) || (value == 180)) {
      this.lastdays = value/30;
    } else if (value == 360) {
      this.lastdays = 1;
    }
    //this.lineChart.destroy();
    //this.subscription.unsubscribe();
    this.getVisitorsByLastNDays(value);
  }

  getVisitorsByLastNDays(lastdays) {
    this.analyticsService.getVisitorsByDay().subscribe((visitorsByDay) => {
      console.log("»» VISITORS BY DAY RESULT: ", visitorsByDay)

      const last7days_initarray = [];
      for (let i = 0; i < lastdays; i++) {
        last7days_initarray.push({ 'count': 0, day: moment().subtract(i, 'd').format('D/M/YYYY') })
      }

      last7days_initarray.reverse();
      console.log("»» LAST 7 DAYS VISITORS - INIT ARRAY: ", last7days_initarray)

      const visitorsByDay_series_array = [];
      const visitorsByDay_labels_array = [];

      // CREATES A NEW ARRAY FROM THE ARRAY RETURNED FROM THE SERVICE SO THAT IT IS COMPARABLE WITH last7days_initarray
      const visitorsByDay_array = [];
      for (let j = 0; j < visitorsByDay.length; j++) {
        if (visitorsByDay[j]) {
          visitorsByDay_array.push({ 'count': visitorsByDay[j]['count'], day: visitorsByDay[j]['_id']['day'] + '/' + visitorsByDay[j]['_id']['month'] + '/' + visitorsByDay[j]['_id']['year'] })
        }
      }

      // MERGE last7days_initarray & visitorsByDay_array
      const visitorsByDays_final_array = last7days_initarray.map(obj => visitorsByDay_array.find(o => o.day === obj.day) || obj);

      this.initDay = visitorsByDays_final_array[0].day;
      this.endDay = visitorsByDays_final_array[lastdays-1].day;
      console.log("INIT", this.initDay, "END", this.endDay);

      visitorsByDays_final_array.forEach((visitByDay) => {
        visitorsByDay_series_array.push(visitByDay.count)
        const splitted_date = visitByDay.day.split('/');
        visitorsByDay_labels_array.push(splitted_date[0] + ' ' + this.monthNames[splitted_date[1]])
      })

      console.log('»» VISITORS BY DAY - SERIES (+ NEW + ARRAY OF COUNT)', visitorsByDay_series_array);
      console.log('»» VISITORS BY DAY - LABELS (+ NEW + ARRAY OF DAY)', visitorsByDay_labels_array);

      const higherCount = this.getMaxOfArray(visitorsByDay_series_array);

      let lang = this.lang;

      var lineChart = new Chart('last7dayVisitors', {
        type: 'line',
        data: {
          labels: visitorsByDay_labels_array,
          datasets: [{
            label: 'Number of visitors in last 7 days ',
            data: visitorsByDay_series_array,
            fill: true,
            lineTension: 0.0,
            backgroundColor: 'rgba(30, 136, 229, 0.6)',
            borderColor: 'rgba(30, 136, 229, 1)',
            borderWidth: 3,
            borderDash: [],
            borderDashOffset: 0.0,
            pointBackgroundColor: 'rgba(255, 255, 255, 0.8)',
            pointBorderColor: '#1e88e5'
          }]
        },
        options: {
          maintainAspectRatio: false,
          title: {
            text: 'TITLE',
            display: false
          },
          legend: {
            display: false
          },
          scales: {
            xAxes: [{
              ticks: {
                beginAtZero: true,
                display: true,
                fontColor: 'black'
              },
              gridLines: {
                display: true,
                borderDash: [8, 4]
              }
            }],
            yAxes: [{
              gridLines: {
                display: true,
                borderDash: [8, 4]
              },
              ticks: {
                beginAtZero: true,
                userCallback: function (label, index, labels) {
                  if (Math.floor(label) === label) {
                    return label;
                  }
                },
                display: true,
                fontColor: 'black',
                suggestedMax: higherCount + 2
              }
            }]
          },
          tooltips: {
            callbacks: {
              label: function (tooltipItem, data) {
                const currentItemValue = tooltipItem.yLabel

                if (lang == 'it') {
                  return 'Visitatori: ' + currentItemValue;
                } else {
                  return 'Visitors: ' + currentItemValue;
                }
              }
            }
          }
        },
        plugins: [{
          beforeDraw: function (chartInstance, easing) {
            var ctx = chartInstance.chart.ctx;
            ctx.height = 128
            ctx.font = "Google Sans"
            var chartArea = chartInstance.chartArea;
          }
        }]
      })

    }, (error) => {
      console.log('»» VISITORS BY DAY - ERROR ', error);
    }, () => {
      console.log('»» VISITORS BY DAY - * COMPLETE * ');
    })
  }

  switchMonthName() {

    if (this.lang) {
      if (this.lang === 'it') {
        this.monthNames = { '1': 'Gen', '2': 'Feb', '3': 'Mar', '4': 'Apr', '5': 'Mag', '6': 'Giu', '7': 'Lug', '8': 'Ago', '9': 'Set', '10': 'Ott', '11': 'Nov', '12': 'Dic' }
      } else {
        this.monthNames = { '1': 'Jan', '2': 'Feb', '3': 'Mar', '4': 'Apr', '5': 'May', '6': 'Jun', '7': 'Jul', '8': 'Aug', '9': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec' }
      }
    }
  }



  getVisitors() {
    this.analyticsService.getVisitors().subscribe((res) => {
      console.log("************* VISITORS API RESULT: ", res)
    })
  }

  getVisitorsByLast7Days() {
    this.analyticsService.getVisitorsByDay().subscribe((visitorsByDay) => {
      console.log("»» VISITORS BY DAY RESULT: ", visitorsByDay)

      const last7days_initarray = [];
      for (let i = 0; i < 7; i++) {
        last7days_initarray.push({ 'count': 0, day: moment().subtract(i, 'd').format('D-M-YYYY') })
      }

      last7days_initarray.reverse();
      console.log("»» LAST 7 DAYS VISITORS - INIT ARRAY: ", last7days_initarray)

      const visitorsByDay_series_array = [];
      const visitorsByDay_labels_array = [];

      // CREATES A NEW ARRAY FROM THE ARRAY RETURNED FROM THE SERVICE SO THAT IT IS COMPARABLE WITH last7days_initarray
      const visitorsByDay_array = [];
      for (let j = 0; j < visitorsByDay.length; j++) {
        if (visitorsByDay[j]) {
          visitorsByDay_array.push({ 'count': visitorsByDay[j]['count'], day: visitorsByDay[j]['_id']['day'] + '/' + visitorsByDay[j]['_id']['month'] + '/' + visitorsByDay[j]['_id']['year'] })
        }
      }

      // MERGE last7days_initarray & visitorsByDay_array
      const visitorsByDays_final_array = last7days_initarray.map(obj => visitorsByDay_array.find(o => o.day === obj.day) || obj);

      visitorsByDays_final_array.forEach((visitByDay) => {
        visitorsByDay_series_array.push(visitByDay.count)
        const splitted_date = visitByDay.day.split('/');
        visitorsByDay_labels_array.push(splitted_date[0] + ' ' + this.monthNames[splitted_date[1]])
      })

      console.log('»» VISITORS BY DAY - SERIES (+ NEW + ARRAY OF COUNT)', visitorsByDay_series_array);
      console.log('»» VISITORS BY DAY - LABELS (+ NEW + ARRAY OF DAY)', visitorsByDay_labels_array);

      const higherCount = this.getMaxOfArray(visitorsByDay_series_array);

      let lang = this.lang;

      var lineChart = new Chart('last7dayVisitors', {
        type: 'line',
        data: {
          labels: visitorsByDay_labels_array,
          datasets: [{
            label: 'Number of visitors in last 7 days ',
            data: visitorsByDay_series_array,
            fill: true,
            lineTension: 0.0,
            backgroundColor: 'rgba(30, 136, 229, 0.6)',
            borderColor: 'rgba(30, 136, 229, 1)',
            borderWidth: 3,
            borderDash: [],
            borderDashOffset: 0.0,
            pointBackgroundColor: 'rgba(255, 255, 255, 0.8)',
            pointBorderColor: '#1e88e5'
          }]
        },
        options: {
          maintainAspectRatio: false,
          title: {
            text: 'TITLE',
            display: false
          },
          legend: {
            display: false
          },
          scales: {
            xAxes: [{
              ticks: {
                beginAtZero: true,
                display: true,
                fontColor: 'black'
              },
              gridLines: {
                display: true,
                borderDash: [8, 4]
              }
            }],
            yAxes: [{
              gridLines: {
                display: true,
                borderDash: [8, 4]
              },
              ticks: {
                beginAtZero: true,
                userCallback: function (label, index, labels) {
                  if (Math.floor(label) === label) {
                    return label;
                  }
                },
                display: true,
                fontColor: 'black',
                suggestedMax: higherCount + 2
              }
            }]
          },
          tooltips: {
            callbacks: {
              label: function (tooltipItem, data) {
                const currentItemValue = tooltipItem.yLabel

                if (lang == 'it') {
                  return 'Visitatori: ' + currentItemValue;
                } else {
                  return 'Visitors: ' + currentItemValue;
                }
              }
            }
          }
        },
        plugins: [{
          beforeDraw: function (chartInstance, easing) {
            var ctx = chartInstance.chart.ctx;
            ctx.height = 128
            ctx.font = "Google Sans"
            var chartArea = chartInstance.chartArea;
          }
        }]
      })

    }, (error) => {
      console.log('»» VISITORS BY DAY - ERROR ', error);
    }, () => {
      console.log('»» VISITORS BY DAY - * COMPLETE * ');
    })
  }

  getMaxOfArray(requestsByDay_series_array) {
    return Math.max.apply(null, requestsByDay_series_array);
  }

  getVisitorsWeek() {
    this.analyticsService.getVisitorsByLast7Days().subscribe((res) => {
      console.log("************* VISITORS BY WEEK RESULT: ", res)
    })
  }

  getVisitorsMonth() {
    this.analyticsService.getVisitorsByLastMonth().subscribe((res) => {
      console.log("************* VISITORS BY MONTH RESULT: ", res)
    })
  }

}
