Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',

	_initDate: undefined,
    _endDate: undefined,
    _selectedMilestones: undefined,
    _filterPlannedStartDate: undefined,
    _filterPlannedEndDate: undefined,
    _filterInitiative: undefined,
    _filterParent: undefined,
    _filterProject: undefined,
    _exportData: undefined,
    _exportButton: undefined,

    items:[
        {
            xtype:'container',
            itemId:'header',
            cls:'header'
        },
        {
            xtype:'container', 
            itemId:'bodyContainer',
            layout: {
		        type: 'hbox'
		    },
            height:'90%',
            width:'100%',
            autoScroll:true
        }
    ],


    launch: function() {
        //Write app code here

        //API Docs: https://help.rallydev.com/apps/2.1/doc/
        var context = this.getContext();
		var project = context.getProject()['ObjectID'];
		this.projectId = project;
		this._milestoneComboStore = undefined;		

		console.log('project:', project);
		this._milestoneCombo = Ext.widget('rallymilestonecombobox', {
			itemId: 'milestonecombobox',
			allowClear: true,
			multiSelect: true,
			width: 300,
			listeners: {
				change: function(combo) {
					//console.log('change: ', combo);
					console.log('change: ', combo.getValue());
					//console.log('store', this._milestoneComboStore);

					if (combo.getValue() && combo.getValue() != '' && combo.valueModels.length > 0) {
						var milestones = combo.valueModels;
						milestones.sort(
							function(a, b) {
								return a.get('TargetDate').getTime() - b.get('TargetDate').getTime();
							}
						);

						this._selectedMilestones = milestones;

						this._doSearch(milestones);
					} else {
						this._applyMilestoneRangeFilter(this._initDate, this._endDate, this._milestoneComboStore, this);
					}
				},
				beforerender: function(combo) {
					console.log('beforerender: ', combo);
					this._blockFilters();

					//console.log('store', this._milestoneComboStore);
					//this._setFilter(combo.value);
				},
				ready: function(combo) {
					console.log('ready: ', combo.value);
					this._unBlockFilters();
					//console.log('store', this._milestoneComboStore);
					//this._setFilter(combo.value);
				},
				scope: this
			}
		});

		this._milestoneComboStore = this._milestoneCombo.getStore();

		this.down('#header').add([
		{
			xtype: 'panel',
			autoWidth: true,
			//height: 120,
			layout: 'hbox',

			items: [{
				xtype: 'panel',
				title: 'Choose date range for milestone:',
				//width: 450,
				//layout: 'fit',
				flex: 3,
				align: 'stretch',
				autoHeight: true,
				bodyPadding: 10,
				items: [{
					xtype: 'datefield',
					anchor: '100%',
			        fieldLabel: 'From',
					scope: this,
		        	listeners : {
		        		change: function(picker, newDate, oldDate) {
		        			this._initDate = newDate;
		        			var that = this;

		        			//console.log('Store:', this._milestoneComboStore);
		        			this._applyMilestoneRangeFilter(this._initDate, this._endDate, this._milestoneComboStore, that);
		        		},
		        		scope:this
		        	}
				}, {
					xtype: 'datefield',
					anchor: '100%',
			        fieldLabel: 'To',
					scope: this,
		        	listeners : {
		        		change: function(picker, newDate, oldDate) {
		        			this._endDate = newDate;
		        			var that = this;

		        			//console.log('Store:', this._milestoneComboStore);
		        			this._applyMilestoneRangeFilter(this._initDate, this._endDate, this._milestoneComboStore, that);
		        		},
		        		scope:this
		        	}
				},
				{
					xtype: 'rallycheckboxfield',
					fieldLabel: 'Extra Filters:',
					itemId: 'extraFilters',
					listeners : {
		        		change: function(checkbox, newValue, oldValue) {
		        			console.log('value check:', newValue);

		        			if (newValue) {
		        				this._showExtraFilters();
		        			} else {
		        				this._hideExtraFilters();
		        			}
		        		},
		        		scope:this
		        	}
				},
				{
					xtype: 'panel',
					itemId: 'extraFiltersPanel',
					layout: 'hbox',
					hidden: true,
					align: 'stretch',
					bodyPadding: 10,
					items: [{
						xtype: 'datefield',
				        fieldLabel: 'Planned Start Date',
				        margin: '0 15 0 0',
						scope: this,
			        	listeners : {
			        		change: function(picker, newDate, oldDate) {
			        			this._filterPlannedStartDate = newDate;
			        			// var that = this;

			        			//console.log('Store:', this._milestoneComboStore);
			        		},
			        		scope:this
			        	}
					},
					{
						xtype: 'datefield',
				        fieldLabel: 'Planned End Date',
				        margin: '0 15 0 0',
						scope: this,
			        	listeners : {
			        		change: function(picker, newDate, oldDate) {
			        			this._filterPlannedEndDate = newDate;
			        			// var that = this;

			        			//console.log('Store:', this._milestoneComboStore);
			        		},
			        		scope:this
			        	}
					},
					{
				        xtype: 'rallytextfield',
				        fieldLabel: 'Parent',
				        margin: '0 15 0 0',
				        scope: this,
				        listeners : {
			        		change: function(textField, newValue, oldValue) {
			        			this._filterParent = newValue;
			        			// var that = this;

			        			console.log('filter parent:', this._filterParent);
			        		},
			        		scope:this
			        	}

				    },
				    {
				        xtype: 'rallytextfield',
				        fieldLabel: 'Initiative ID',
				        margin: '0 15 0 0',
				        scope: this,
				        listeners : {
			        		change: function(textField, newValue, oldValue) {
			        			this._filterInitiative = newValue;
			        			// var that = this;

			        			console.log('filter Initiative:', this._filterInitiative);
			        		},
			        		scope:this
			        	}

				    },
				    {
				        xtype: 'rallytextfield',
				        fieldLabel: 'Project',
				        margin: '0 15 0 0',
				        scope: this,
				        listeners : {
			        		change: function(textField, newValue, oldValue) {
			        			this._filterProject = newValue;
			        			// var that = this;

			        			console.log('filter project:', this._filterProject);
			        		},
			        		scope:this
			        	}
				    },
				    {
				        xtype: 'rallybutton',
				        text: 'Apply Filter',
				        margin: '0 15 0 0',
				        scope: this,
				        handler: function() {
			        		console.log('Apply filter');
			        		this._doSearch(this._selectedMilestones);
			        	}
				    }]
				}]
			}]
		},
		{
			xtype: 'fieldcontainer',
			fieldLabel: 'Milestone',
			pack: 'end',
			labelAlign: 'right',
			items: [
				this._milestoneCombo
			]
		}]);

    },


	_createExportButton: function(rows) {
		var button = Ext.create('Rally.ui.Button', {
        	text: 'Export',
        	margin: '10 10 10 10',
        	scope: this,
        	handler: function() {
        		var csv = this._convertToCSV(rows);
        		console.log('converting to csv:', csv);


        		//Download the file as CSV
		        var downloadLink = document.createElement("a");
		        var blob = new Blob(["\ufeff", csv]);
		        var url = URL.createObjectURL(blob);
		        downloadLink.href = url;
		        downloadLink.download = "report.csv";  //Name the file here
		        document.body.appendChild(downloadLink);
		        downloadLink.click();
		        document.body.removeChild(downloadLink);
        	}
        });

		return button;
	},


    _blockFilters: function() {
		this.down('#header').disable();
	},


	_unBlockFilters: function() {
		this.down('#header').enable();
	},


	_hideExtraFilters: function() {
		this.down('#extraFiltersPanel').hide();
	},


	_showExtraFilters: function() {
		this.down('#extraFiltersPanel').show();
	},


	_doSearch: function(milestones) {
		this.setLoading();
		this.down('#bodyContainer').removeAll(true);

		this._exportData = new Ext.util.MixedCollection();

		var promises = [];
		for (var m of milestones) {
			promises.push(this._buildMilestoneColumn(m));
		}


		Deft.Promise.all(promises).then({
			success: function(records) {
				this.setLoading(false);

				var rows = this._convertExportDataToJson(this._exportData);


				if (!this._exportButton) {
					this._exportButton = this._createExportButton(rows);
		        	this.down('#header').add(this._exportButton);
				} else {
					this.down('#header').remove(this._exportButton);
					this._exportButton = this._createExportButton(rows);
		        	this.down('#header').add(this._exportButton);
				}                             
            },
            scope: this
		});
		//this._setFilter(combo.value);
		//this._buildSummaryBoard(milestones);
	},


	_applyMilestoneRangeFilter: function(initDate, endDate, store, scope) {
		//console.log(initDate, endDate, store, scope);
		if (initDate && !endDate) {
			this._milestoneComboStore.filterBy(function(record) {
				if (record.get('TargetDate')) {
					if (record.get('TargetDate').getTime() > initDate.getTime()) {
						return record;
					}
				}
			}, scope);

		} else if (endDate && !initDate) {
			this._milestoneComboStore.filterBy(function(record) {
				if (record.get('TargetDate')) {
					if (record.get('TargetDate').getTime() < endDate.getTime()) {
						return record;
					}
				}
			}, scope);
		} else if (initDate && endDate) {
			this._milestoneComboStore.filterBy(function(record) {
				if (record.get('TargetDate')) {
					if ((record.get('TargetDate').getTime() > initDate.getTime()) && 
						(record.get('TargetDate').getTime() < endDate.getTime())) {
						return record;
					}
				}
			}, scope);
		} else {
			this._milestoneComboStore.filterBy(function(record) {				
				return record;
			});
		}

	},


	_buildMilestoneColumn: function(milestone) {
		//console.log('milestone', milestone);
		var deferred = Ext.create('Deft.Deferred');

		var targetDate = milestone.get('TargetDate');
		var milestoneId = milestone.get('ObjectID');
		var milestoneTag = milestone.get('_ref');
		var milestoneName = milestone.get('Name');

		var colId = 'milestone-'+milestoneId;
		var colName = targetDate.toLocaleDateString();

		//console.log(colId, colName);

		var column = Ext.create('Ext.panel.Panel', {
			title: 'Target Date: '+ colName,
			width: 320,
            layout: {
                type: 'vbox',                
                padding: 5
            },
            padding: 5,
            itemId: colId
		});

		var filter = {
			property: 'Milestones',
			operator: 'contains',
			value: milestoneTag
		};

		var boxExtraFilter = this.down('#extraFilters');
		if (boxExtraFilter.value) {
			console.log('using extraFilters');

			if (this._filterPlannedStartDate) {
				filter = Rally.data.QueryFilter.and([
						filter,
					{
						property: 'PlannedStartDate',
						operator: '>=',
						value: this._filterPlannedStartDate
					}
				]);
			}

			if (this._filterPlannedEndDate) {
				filter = Rally.data.QueryFilter.and([
						filter,
					{
						property: 'PlannedEndDate',
						operator: '<=',
						value: this._filterPlannedEndDate
					}
				]);
			}


			if (this._filterProject) {
				filter = Rally.data.QueryFilter.and([
						filter,
					{
						property: 'Project.Name',
						value: this._filterProject
					}
				]);
			}

			if (this._filterParent) {
				filter = Rally.data.QueryFilter.and([
						filter,
					{
						property: 'Parent.Name',
						value: this._filterParent
					}
				]);
			}

			if (this._filterInitiative) {
				filter = Rally.data.QueryFilter.and([
						filter,
					{
						property: 'Parent.FormattedID',
						value: this._filterInitiative
					}
				]);
			}
		}
		

		console.log('filter:', filter);


		var featureStore = Ext.create('Rally.data.wsapi.artifact.Store', {
			context: {
		        projectScopeUp: false,
		        projectScopeDown: true,
		        project: null //null to search all workspace
		    },
			models: ['PortfolioItem/Feature', 'HierarchicalRequirement', 'Defect', 'TestSet'],
			fetch: ['FormattedID', 
					'Name', 
					'Owner', 
					'ObjectID', 
					'Project',
					'Parent', 
					'State', 
					'Type', 
					'PlanEstimate',
					'PreliminaryEstimateValue',
					'LeafStoryPlanEstimateTotal', 
					'PercentDoneByStoryCount', 
					'PercentDoneByStoryPlanEstimate'],
			filters: [
				filter
			],
			limit: Infinity
		});


		featureStore.load().then({
			success: function(records) {
				//console.log('records', records);

				if (records) {
					var summaryCard = this._buildSummaryCard(milestoneName, records);
					column.add(summaryCard);

					var featuresArray = [];
					var exportFeature = {
						milestoneName: milestoneName, 
						milestoneId: milestoneId,
						featuresArray: featuresArray
					};


					//load all stories attached by feature to the milestone.
					var featureIds = [];
					_.each(records, function(feature) {					
						if (feature.get('_type') == 'portfolioitem/feature') {
							featureIds.push(feature.get('ObjectID'));
						}
					}, this);

					var storiesStore = Ext.create('Rally.data.WsapiDataStore', {
						model: 'HierarchicalRequirement',
						context: {
					        projectScopeUp: false,
					        projectScopeDown: true,
					        project: null //null to search all workspace
					    },
						fetch: ['FormattedID', 'Name', 'ObjectID', 'Project', 'ScheduleState', 'Type', 'PlanEstimate', 'Blocked'],
						filters: [{
							property: 'PortfolioItem.ObjectID',
							operator: 'in',
							value: featureIds
						}],
						limit: Infinity
					});

					storiesStore.load().then({
						success: function(stories) {
							console.log('Stories:', stories);

							var artifacts = records.concat(stories);
							console.log('artifacts', artifacts);


							_.each(artifacts, function(artifact) {
								column.add(this._buildKanbanCard(artifact));

								var planEstimate;
								if (artifact.get('_type') == 'portfolioitem/feature') {
									planEstimate = artifact.get('LeafStoryPlanEstimateTotal');
								} else {
									planEstimate = artifact.get('PlanEstimate');
								}

								var featureExp = {
									id : artifact.get('FormattedID'),
									description : artifact.get('Name'),
									planEstimate : planEstimate
								};

								exportFeature.featuresArray.push(featureExp);

							}, this);

							this._exportData.add(milestoneId, exportFeature);

							deferred.resolve();
							//this.setLoading(false);

						},
						scope: this
					});
				}
				
			},
			scope: this
		});

		this.down('#bodyContainer').add(column);

		return deferred.promise;
	},


	_buildSummaryCard: function(milestoneName, records) {
		var totalFeaturePoints = 0;
		var totalLeafStoryPoints = 0;
		var totalDefectsPoints = 0;

		_.each(records, function(feature) {
			var type = feature.get('_type'); 
			if (type == 'portfolioitem/feature') {
				totalFeaturePoints += feature.get('PreliminaryEstimateValue');
				totalLeafStoryPoints += feature.get('LeafStoryPlanEstimateTotal');
			} else {
				totalDefectsPoints += feature.get('PlanEstimate');
			}
		});

		var summaryCard = Ext.widget('propertygrid', {
			title: milestoneName + ' summary:',
			hideHeaders: true, 
			nameColumnWidth: 200,
			padding: '0 0 20 15' ,
			width: 280,
			source: {
                    'Total Feature Pts': totalFeaturePoints,
                    'Total Leaf Story Pts': totalLeafStoryPoints,
                    'Total Defect PTs' : totalDefectsPoints
            },
		});

		return summaryCard;
	},


	_buildKanbanCard: function(record) {
		var card = Ext.widget('rallycard', {
			itemId: record.get('FormattedID'),
			config: {
				record: record
			},
			fields: [ 
				'Name',
				'Owner',
				'FormattedID',
				'Tags',
				'Project',
				'Parent',
				'PlanEstimate',
				'LeafStoryPlanEstimateTotal',
				'PercentDoneByStoryPlanEstimate'
			],
			width: 280,
			record: record
		});

		return card;
	},


	_convertToCSV: function(objArray) {
		// console.log('csv entry:', objArray);
		var fields = Object.keys(objArray[0]);

		var replacer = function(key, value) { return value === null ? '' : value; };
		var csv = objArray.map(function(row){
		  return fields.map(function(fieldName) {
		    return JSON.stringify(row[fieldName], replacer);
		  }).join(',');
		});

		csv.unshift(fields.join(',')); // add header column

		//console.log(csv.join('\r\n'));

		return csv.join('\r\n');
    },


    _convertExportDataToJson: function(exportData) {
    	var data = [];

    	//console.log('converting to export for csv:', exportData);

    	exportData.eachKey(function(milestoneId, milestoneFeatures) {
            //console.log('item:', milestoneFeatures);
    		var milestoneName = milestoneFeatures.milestoneName;

    		_.each(milestoneFeatures.featuresArray, function(feature) {
	    		data.push({
	    			milestoneName: milestoneName,
	    			featureNumber: feature.id,
	    			featureDescription: feature.description,
	    			planEstimate: feature.planEstimate
	    		});
    		}, this);          
        }, 
        this);

    	//console.log('convertion complete:', data);

    	return data;
    }

});
